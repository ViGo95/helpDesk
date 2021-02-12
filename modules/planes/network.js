const express = require('express')
const router = express.Router()
const response = require('../../network/response')
const database = require('../../db')
const model = require('./model')

//      ----------------------------  REGISTRAR PLANES   ----------------------------

router.post('/', (req, res) => {
    const plan = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        costo: req.body.costo
    }

    const duplicatedName = `Error: ER_DUP_ENTRY: Duplicate entry '${plan.nombre}' for key 'nombre'`
    
    const query = 'INSERT INTO planes SET ?'
    
    if (!plan.nombre || !plan.costo) {
        response.error(req, res, 400, '[DB] INCOMPLETED DATA', '[INCOMPLETED DATA]', 'Datos incompletos...')
    
    } else {
        const newPlan = model(plan)

        database.query(query, newPlan, (error, inserted, fields) => {
            if (error) {
                if (error == duplicatedName) {
                    response.error(req, res, 400, `[DB] DUPLICATED NAME ${plan.nombre}`, '[EXISTING PLAN]', `El nombre ${plan.nombre} ya esta registrado...`)
                
                }  else {
                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                }

            } else {
                response.success(req, res, 201, `[DB] INSERTED ${inserted.affectedRows} ROW/S, ID = ${inserted.insertId}`, '[CREATED]', `Plan ${plan.nombre} registrado con el costo ${plan.costo}`)
            }
        })
    }
})

//      ------------------------------  LISTAR PLANES  ------------------------------

router.get('/', (req, res) => {
    var lista = []

    const query = 'SELECT * FROM planes'

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

//      ------------------------------  TRAER PLANES   ------------------------------

router.get('/:id', (req, res) => {
    const id = req.params.id
    const query = 'SELECT * FROM planes WHERE IDPlanes = ?'

    database.query(query, [id], (error, result, fields) => {

        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salió mal :(')
        
        } else if (!result[0]) {
            response.error(req, res, 404, `[BAD REQUEST]: ID = ${id}`, '[BAD REQUEST]', 'El plan que esta buscando no existe...')

        } else {

            if (result[0].status) {
                var status = 'activo'
            } else {
                var status = 'inactivo'
            }

            const plan = {
            nombre: result[0].nombre,
            descripcion: result[0].descripcion,
            costo: result[0].costo,
            status: status
            }

            response.success(req, res, 200, `[DB] SELECTED = ${plan.nombre}`, '[SELECTED]', plan)
        }
    })
})

//      ----------------------------  ACTUALIZAR PLANES  ----------------------------

router.patch('/:id', (req, res) => {
    const id = req.params.id

    const changes = {}
    var affectedFields = ''
    var updateQuery = ''
    var data = []

    const selectQuery = 'SELECT * FROM planes WHERE IDPlanes = ?'
    
    database.query(selectQuery, [id], (error, plan, fields) => {
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
        
        } else if (req.body.status > 1) {
            response.error(req, res, 400, `[DB] BAD STATUS VALUE = ${status}`, '[BAD REQUEST]', 'La casilla "status" solo puede estar activa o inactiva...')
        
        } else if (!plan[0]) {
            response.error(req, res, 400, `[DB] SELECTED = ${plan[0]}`, '[BAD REQUEST]', 'El plan seleccionado es invalido...')
            
        } else {
            
            if (req.body.costo) {
                if (req.body.costo != plan[0].costo) {
                    var costo = req.body.costo
                    updateQuery = 'costo = ?'
                    data.push(costo) 
                    changes.costo = costo
                    affectedFields ++
                }
            }

            if (req.body.status === 0 || req.body.status === 1) {
                if (req.body.status != plan[0].status) {
                    var status = req.body.status
                    if (status == 1) {
                        var preactive = 'inactivo'
                        var active = 'activo'
                    } else {
                        var preactive = 'activo'
                        var active = 'inactivo'
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

                database.query(`UPDATE planes SET ${updateQuery} WHERE IDPlanes = ?`, data, (error, updated, fields) => {
                    if (error) {
                        response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                        
                    } else if (!affectedFields) {
                        response.error(req, res, 400, `[DB] UPDATED ROWS = 0`, '[NO CHANGES]', 'No hay cambios registrados.')
                        
                    } else if (active) {
                        response.success(req, res, 200, `[DB] UPDATED ${updated.affectedRows} ROW/S; STATUS`, '[STATUS UPDATE]', `El plan ${plan[0].nombre} paso de estar ${preactive} a ${active}!`)
                        
                    } else {    
                        response.success(req, res, 200, `[DB] UPDATED ${updated.affectedRows} ROW/S; ${affectedFields} FIELD/S`, '[UPDATED]', changes)
                    }
                })
            }
        }
    })
})

//      -----------------------------  ELIMINAR PLANES  -----------------------------

router.delete('/:id', (req, res) => {
    const id = req.params.id

    const selectQuery = 'SELECT * FROM planes WHERE IDPlanes = ?'
    const deleteQuery = 'DELETE FROM planes WHERE IDPlanes = ?'

    database.query(selectQuery, [id], (error, plan, fields) => {
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]')
            
        } else {

            database.query(deleteQuery, [id], (error, deleted, fields) => {
        
                if (error) {
                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
                
                } else if (!plan[0]) {
                    response.error(req, res, 400, `[DB] SELECTED = ${error}`, '[BAD REQUEST]', 'El plan que esta buscando no existe...')
               
                } else {
                    response.success(req, res, 200, `[DB] DELETED ${deleted.affectedRows} ROW/S`, '[DELETED]', `El plan ${plan[0].nombre} fue eliminado exitosamente!`)
                }
        
            })
        }
    })
})

module.exports = router