const express = require('express')
const router = express.Router()
const response = require('../../network/response')
const database = require('../../db')
const model = require('./model')
const encrypt = require('../../components/encryption').encrypt
const badPlanId = "Error: ER_NO_REFERENCED_ROW_2: Cannot add or update a child row: a foreign key constraint fails (`vigo`.`empresas`, CONSTRAINT `planesEmpresas` FOREIGN KEY (`planesID`) REFERENCES `planes` (`IDPlanes`) ON DELETE NO ACTION ON UPDATE NO ACTION)"

//      ----------------------------  REGISTRAR EMPRESAS   ----------------------------

router.post('/', (req, res) => {
    const empresa = {
        nombre: req.body.nombre,
        usuario: req.body.usuario,
        clave: req.body.clave,
        descripcion: req.body.descripcion,
        direccion: req.body.direccion,
        plan: req.body.plan
    }

    const duplicatedUser = `Error: ER_DUP_ENTRY: Duplicate entry '${empresa.nombre}' for key 'usuario'`

    const insertQuery = 'INSERT INTO empresas SET ?'
    const selectQuery = 'SELECT * FROM planes WHERE IDPlanes = ?'
    
    if (!empresa.nombre || !empresa.usuario || !empresa.clave || !empresa.direccion || !empresa.plan) {
        response.error(req, res, 400, '[DB] INCOMPLETED DATA', '[INCOMPLETED DATA]', 'Datos incompletos...')
    
    } else {
        empresa.clave = encrypt(req.body.clave)
        const newEmpresa = model(empresa)
        
        database.query(selectQuery, empresa.plan, (error, plan, fields) => {
            if (error) {
                response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
           
            } else {
                database.query(insertQuery, newEmpresa, (error, inserted, fields) => {
                    if (error) {
                        if (error == duplicatedUser) {
                            response.error(req, res, 400, `[DB] DUPLICATED USER ${empresa.usuario}`, '[EXISTING USER]', `El usuario ${empresa.usuario} ya esta registrado...`)
                       
                        } else if (error == badPlanId) {
                            response.error(req, res, 400, `[DB] INVALID PLAN`, '[BAD REQUEST]', 'El plan que intenta seleccionar no existe...')
                        
                        }else {
                            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                        }
    
                    } else {
                        response.success(req, res, 201, `[DB] INSERTED ${inserted.affectedRows} ROW/S, ID = ${inserted.insertId}`, '[REGISTERED]', `Empresa ${empresa.nombre} registrada con el plan ${plan[0].nombre}`)
                    }
                })
            }
        })
    }
})

//      ------------------------------  LISTAR EMPRESAS  ------------------------------

router.get('/', (req, res) => {
    var lista = []

    const query = 'SELECT * FROM empresas'

    database.query(query, (error, list, fields) => {
        
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
        
        } else {
            
            for (let i = 0; i < list.length; i++) {
                lista.push(list[i].nombre)
            }

            response.success(req, res, 200, `[DB] SELECTED = ${lista}`, '[LISTED]', lista)
        }
    })
})

//      ------------------------------  TRAER EMPRESAS   ------------------------------

router.get('/:id', (req, res) => {
    const id = req.params.id
    const query = `SELECT e.nombre, e.descripcion, e.direccion, e.status, p.nombre AS plan
                   FROM empresas AS e
                   INNER JOIN planes AS p
                   ON e.planesID = p.IDPlanes
                   WHERE IDEmpresas = ?`

    database.query(query, [id], (error, result, fields) => {

        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salió mal :(')
        
        } else if (!result[0]) {
            response.error(req, res, 404, `[BAD REQUEST]: ID = ${id}`, '[BAD REQUEST]', 'La empresa que eta buscando no existe...')

        } else {

            if (result[0].status) {
                var status = 'activo'
            } else {
                var status = 'inactivo'
            }

            const empresa = {
            nombre: result[0].nombre,
            usuario: result[0].usuario,
            descripcion: result[0].descripcion,
            direccion: result[0].direccion,
            status: status,
            plan: result[0].plan,
            }

            response.success(req, res, 200, `[DB] SELECTED = ${empresa.nombre}`, '[SELECTED]', empresa)
        }
    })
})

//      ----------------------------  ACTUALIZAR EMPRESAS  ----------------------------

router.patch('/:id', (req, res) => {
    const id = req.params.id

    const changes = {}
    var affectedFields = ''
    var updateQuery = ''
    var data = []
    
    const selectQuery = 'SELECT * FROM empresas WHERE IDEmpresas = ?'

    database.query(selectQuery, [id], (error, empresa, fields) => {
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
        
        } else if (req.body.status > 1) {
            response.error(req, res, 400, `[DB] BAD STATUS VALUE = ${status}`, '[BAD REQUEST]', 'La casilla "status" solo puede estar activa o inactiva...')
        
        } else if (!empresa[0]) {
            response.error(req, res, 400, `[DB] SELECTED = ${empresa[0]}`, '[BAD REQUEST]', 'El empresa seleccionada es invalida...')
            
        } else {
            
            if (req.body.descripcion) {
                if (req.body.descripcion != empresa[0].descripcion) {
                    var descripcion = req.body.descripcion
                    updateQuery = 'descripcion = ?'
                    data.push(descripcion) 
                    changes.descripcion = descripcion
                    affectedFields ++
                }
            } 
            
            if (req.body.direccion) {
                if (req.body.direccion != empresa[0].direccion) {
                    if (data.length == 1) {
                        updateQuery += ', direccion = ?'
                    
                    } else {
                        updateQuery += 'direccion = ?'
                    }

                    var direccion = req.body.direccion
                    data.push(direccion)              
                    changes.direccion = direccion
                    affectedFields ++
                }
            }

            if (req.body.plan) {
                if (req.body.plan != empresa[0].plan) {
                    if (data.length == 2) {
                        updateQuery += ', planesID = ?'
                    
                    } else {
                        updateQuery += 'planesID = ?'
                    }

                    var plan = req.body.plan
                    data.push(plan)              
                    changes.plan = plan
                    affectedFields ++
                }
            }

            if (req.body.status === 0 || req.body.status === 1) {
                if (req.body.status != empresa[0].status) {
                    var status = req.body.status
                    if (status == 1) {
                        var preactive = 'inactiva'
                        var active = 'activa'
                    } else {
                        var preactive = 'activa'
                        var active = 'inactiva'
                    }
                    updateQuery = 'status = ?'
                    data.push(status)
                    changes.status = status
                    affectedFields ++
                }
            }
            data.push(id)
            
            if (data.length == 1) {
                response.error(req, res, 400, `[DB] UPDATED ROWS = 0`, '[NO CHANGES]', 'No hay cambios registrados.')
            } else {

                database.query(`UPDATE empresas SET ${updateQuery} WHERE IDEmpresas = ?`, data, (error, updated, fields) => {
                    if (error) {
                        response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                        
                    } else if (!affectedFields) {
                        response.error(req, res, 400, `[DB] UPDATED ROWS = 0`, '[NO CHANGES]', 'No hay cambios registrados.')
                        
                    } else if (active) {
                        response.success(req, res, 200, `[DB] UPDATED ${updated.affectedRows} ROW/S; STATUS`, '[STATUS UPDATE]', `El empresa ${empresa[0].nombre} paso de estar ${preactive} a ${active}!`)
                        
                    } else {    
                        response.success(req, res, 200, `[DB] UPDATED ${updated.affectedRows} ROW/S; ${affectedFields} FIELD/S`, '[UPDATED]', changes)
                    }
                })
            }
        }
    })
})

//      -----------------------------  ELIMINAR EMPRESAS  -----------------------------

router.delete('/:id', (req, res) => {
    const id = req.params.id

    const selectQuery = 'SELECT * FROM empresas WHERE IDEmpresas = ?'
    const deleteQuery = 'DELETE FROM empresas WHERE IDEmpresas = ?'

    database.query(selectQuery, [id], (error, empresa, fields) => {
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]')
            
        } else {

            database.query(deleteQuery, [id], (error, deleted, fields) => {
        
                if (error) {
                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
                
                } else if (!empresa[0]) {
                    response.error(req, res, 400, `[DB] SELECTED = ${error}`, '[BAD REQUEST]', 'La empresa seleccionada es invalida...')
               
                } else {
                    response.success(req, res, 200, `[DB] DELETED ${deleted.affectedRows} ROW/S`, '[DELETED]', `${empresa[0].nombre} eliminada exitosamente!`)
                }
        
            })
        }
    })

})

module.exports = router