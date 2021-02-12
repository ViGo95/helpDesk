const express = require('express')
const router = express.Router()
const response = require('../../network/response')
const database = require('../../db')
const model = require('./model')
const duplicatedName = "Error: ER_DUP_ENTRY: Duplicate entry 'Configuracion de servicios locales' for key 'nombre_UNIQUE'"
const badAreaId = "Error: ER_NO_REFERENCED_ROW_2: Cannot add or update a child row: a foreign key constraint fails (`vigo`.`servicios`, CONSTRAINT `areasServicios` FOREIGN KEY (`areasID`) REFERENCES `areas` (`IDAreas`) ON DELETE NO ACTION ON UPDATE NO ACTION)"

//      ----------------------------  REGISTRAR SERVICIOS   ----------------------------

router.post('/', (req, res) => {
    const servicio = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        coste: req.body.coste,
        remoto: req.body.remoto,
        area: req.body.area
    }
    const selectQuery = 'SELECT * FROM areas WHERE IDAreas = ?'
    const insertQuery = 'INSERT INTO servicios SET ?'
    
    if (!servicio.nombre || !servicio.descripcion || !servicio.coste || !servicio.remoto || !servicio.area) {
        response.error(req, res, 400, '[DB] INCOMPLETED DATA', '[INCOMPLETED DATA]', 'Datos incompletos...')
    
    } else if (servicio.remoto > 1) {
        response.error(req, res, 400, `[DB] BAD REMOTE VALUE = ${servicio.remoto}`, '[BAD REQUEST]', 'La casilla "Remoto" solo puede estar activa o inactiva...')
    
    } else {
        const newServicio = model(servicio)
        
        database.query(selectQuery, servicio.area, (error, area, fields) => {
            if (error) {
                response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
           
            } else {
                database.query(insertQuery, newServicio, (error, inserted, fields) => {
                    if (error) {
                        if (error == duplicatedName) {
                            response.error(req, res, 400, `[DB] DUPLICATED USER ${servicio.nombre}`, '[EXISTING USER]', `El servicio ${servicio.nombre} ya esta asignado...`)
                       
                        } else if (error == badAreaId) {
                            response.error(req, res, 400, `[DB] INVALID AREA`, '[BAD REQUEST]', 'El area en la que quiere registrar el servicio no existe...')
                        
                        } else {
                            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                        }
    
                    } else {
                        response.success(req, res, 201, `[DB] INSERTED ${inserted.affectedRows} ROW/S, ID = ${inserted.insertId}`, '[REGISTERED]', `Nuevo servicio de ${servicio.nombre} creado y asignado al area de ${area[0].nombre}`)
                    }
                })
            }
        })
    }
})

//      ------------------------------  LISTAR SERVICIOS  ------------------------------

router.get('/', (req, res) => {
    var lista = []
    var nameList = []

    const query = `SELECT s.nombre, a.nombre AS area 
                   FROM servicios AS s 
                   JOIN areas AS a 
                   ON s.areasID = a. IDAreas 
                   ORDER BY area`

    database.query(query, (error, list, fields) => {
        
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
        
        } else {

            for (let i = 0; i < list.length; i++){
                nameList.push(list[i].nombre)
            }
            
            for (let i = 0; i < list.length; i++) {
                lista.push(list[i])
            }

            response.success(req, res, 200, `[DB] SELECTED = ${nameList}`, '[LISTED]', lista)
        }
    })
})

//      ------------------------------  TRAER SERVICIOS   ------------------------------

router.get('/:id', (req, res) => {
    const id = req.params.id
    const query = `SELECT s.nombre, s.descripcion, s.coste, s.remoto, s.status, a.nombre AS area 
                   FROM servicios AS s 
                   JOIN areas AS a 
                   ON s.areasID = a. IDAreas
                   WHERE IDServicios = ?`

    database.query(query, [id], (error, result, fields) => {

        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salió mal :(')
        
        } else if (!result[0]) {
            response.error(req, res, 404, `[DB] BAD REQUEST ID = ${id}`, '[BAD REQUEST]', 'El servicio que esta buscando no existe...')

        } else {

            if (result[0].status) {
                var status = 'activo'
            } else {
                var status = 'inactivo'
            }

            if (result[0].remoto) {
                var remoto = 'Es posible el servicio remoto'
            } else {
                var remoto = 'No es posible el servicio remoto'
            }

            const servicio = {
            nombre: result[0].nombre,
            descripcion: result[0].descripcion,
            coste: result[0].coste,
            remoto: remoto,
            status: status,
            area: result[0].area,
            }

            response.success(req, res, 200, `[DB] SELECTED = ${servicio.nombre}`, '[SELECTED]', servicio)
        }
    })
})

//      ----------------------------  ACTUALIZAR SERVICIOS  ----------------------------

router.patch('/:id', (req, res) => {
    const id = req.params.id

    const changes = {}
    var affectedFields = ''
    var updateQuery = ''
    var data = []

    const selectQuery = 'SELECT * FROM servicios WHERE IDServicios = ?'
    
    database.query(selectQuery, [id], (error, servicio, fields) => {
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
        
        } else if (req.body.status > 1) {
            response.error(req, res, 400, `[DB] BAD STATUS VALUE = ${status}`, '[BAD REQUEST]', 'La casilla "status" solo puede estar activa o inactiva...')
        
        } else if (!servicio[0]) {
            response.error(req, res, 400, `[DB] SELECTED = ${servicio[0]}`, '[BAD REQUEST]', 'El servicio que esta buscando no existe...')
            
        } else {
            
            if (req.body.descripcion) {
                if (req.body.descripcion != servicio[0].descripcion) {
                    var descripcion = req.body.descripcion
                    updateQuery = 'descripcion = ?'
                    data.push(descripcion) 
                    changes.descripcion = descripcion
                    affectedFields ++
                }
            } 
            
            if (req.body.coste) {
                if (req.body.coste != servicio[0].coste) {
                    if (data.length == 1) {
                        updateQuery += ', coste = ?'
                    
                    } else {
                        updateQuery += 'coste = ?'
                    }

                    var coste = req.body.coste
                    data.push(coste)              
                    changes.coste = coste
                    affectedFields ++
                }
            }

            if (req.body.remoto || req.body.remoto === 0) {
                if (req.body.remoto != servicio[0].remoto) {
                    if (data.length == 2) {
                        updateQuery += ', remoto = ?'
                    
                    } else {
                        updateQuery += 'remoto = ?'
                    }

                    var remoto = req.body.remoto
                    if (req.body.remoto === 0) {
                        changes.remoto = 'No'
                    } else {
                        changes.remoto = 'Si'
                    }
                    data.push(remoto)              
                    affectedFields ++
                }
            }

            if (req.body.status === 0 || req.body.status === 1) {
                if (req.body.status != servicio[0].status) {
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
                database.query(`UPDATE servicios SET ${updateQuery} WHERE IDServicios = ?`, data, (error, updated, fields) => {
                    if (error) {
                        response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                        
                    } else if (!affectedFields) {
                        response.error(req, res, 400, `[DB] UPDATED ROWS = 0`, '[NO CHANGES]', 'No hay cambios registrados.')
                        
                    } else if (active) {
                        response.success(req, res, 200, `[DB] UPDATED ${updated.affectedRows} ROW/S; STATUS`, '[STATUS UPDATE]', `El servicio ${servicio[0].nombre} paso de estar ${preactive} a ${active}!`)
                        
                    } else {    
                        response.success(req, res, 200, `[DB] UPDATED ${updated.affectedRows} ROW/S; ${affectedFields} FIELD/S`, '[UPDATED]', changes)
                    }
                })
            }
        }
    })
})

//      -----------------------------  ELIMINAR SERVICIOS  -----------------------------

router.delete('/:id', (req, res) => {
    const id = req.params.id

    const selectQuery = 'SELECT * FROM servicios WHERE IDServicios = ?'
    const deleteQuery = 'DELETE FROM servicios WHERE IDServicios = ?'

    database.query(selectQuery, [id], (error, servicio, fields) => {
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]')
            
        } else {
            database.query(deleteQuery, [id], (error, deleted, fields) => {
        
                if (error) {
                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
                
                } else if (!servicio[0]) {
                    response.error(req, res, 400, `[DB] SELECTED = ${error}`, '[BAD REQUEST]', 'El servicio que desea eliminar no existe...')
               
                } else {
                    response.success(req, res, 200, `[DB] DELETED ${deleted.affectedRows} ROW/S`, '[DELETED]', `Servicio ${servicio[0].nombre} eliminado exitosamente!`)
                }
            })
        }
    })
})

module.exports = router