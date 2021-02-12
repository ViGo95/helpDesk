const express = require('express')
const router = express.Router()
const response = require('../../network/response')
const database = require('../../db')
const model = require('./model')

//      ----------------------------  REGISTRAR AREAS   ----------------------------

router.post('/', (req, res) => {
    const area = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        email: req.body.email
    }

    const duplicatedEmail = `Error: ER_DUP_ENTRY: Duplicate entry '${area.nombre}' for key 'nombre'`

    const query = 'INSERT INTO areas SET ?'
    
    if (!area.nombre || !area.email) {
        response.error(req, res, 400, '[DB] INCOMPLETED DATA', '[INCOMPLETED DATA]', 'Datos incompletos...')
    
    } else {
        const newArea = model(area)

        database.query(query, newArea, (error, inserted, fields) => {
            if (error) {
                if (error == duplicatedEmail) {
                    response.error(req, res, 400, `[DB] DUPLICATED EMAIL ${area.email}`, '[EXISTING EMAIL]', `El correo ${area.email} ya esta registrado...`)
                
                }  else {
                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                }

            } else {
                response.success(req, res, 201, `[DB] INSERTED ${inserted.affectedRows} ROW/S, ID = ${inserted.insertId}`, '[CRATEDA]', `Area ${area.nombre} registrada con el email ${area.email}`)
            }
        })
    }
})

//      ------------------------------  LISTAR AREAS  ------------------------------

router.get('/', (req, res) => {
    var lista = []

    const query = 'SELECT * FROM areas'

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

//      ------------------------------  TRAER AREAS   ------------------------------

router.get('/:id', (req, res) => {
    const id = req.params.id
    const query = 'SELECT * FROM areas WHERE IDAreas = ?'

    database.query(query, [id], (error, result, fields) => {

        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salió mal :(')
        
        } else if (!result[0]) {
            response.error(req, res, 404, `[BAD REQUEST]: ID = ${id}`, '[BAD REQUEST]', 'El area que esta buscando no existe...')

        } else {

            if (result[0].status) {
                var status = 'activo'
            } else {
                var status = 'inactivo'
            }

            const area = {
            nombre: result[0].nombre,
            descripcion: result[0].descripcion,
            email: result[0].email,
            status: status
            }

            response.success(req, res, 200, `[DB] SELECTED = ${area.nombre}`, '[SELECTED]', area)
        }
    })
})

//      ----------------------------  ACTUALIZAR AREAS  ----------------------------

router.patch('/:id', (req, res) => {
    const id = req.params.id

    const changes = {}
    var affectedFields = ''
    var updateQuery = ''
    var data = []

    const selectQuery = 'SELECT * FROM areas WHERE IDAreas = ?'
    
    database.query(selectQuery, [id], (error, area, fields) => {
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
        
        } else if (req.body.status > 1) {
            response.error(req, res, 400, `[DB] BAD STATUS VALUE = ${status}`, '[BAD REQUEST]', 'La casilla "status" solo puede estar activa o inactiva...')
        
        } else if (!area[0]) {
            response.error(req, res, 400, `[DB] SELECTED = ${area[0]}`, '[BAD REQUEST]', 'El area que esta buscando no existe...')
            
        } else {
            
            if (req.body.nombre) {
                if (req.body.nombre != area[0].nombre) {
                    var nombre = req.body.nombre
                    updateQuery = 'nombre = ?'
                    data.push(nombre) 
                    changes.nombre = nombre
                    affectedFields ++
                }
            } 
            
            if (req.body.descripcion) {
                if (req.body.descripcion != area[0].descripcion) {
                    if (data.length == 1) {
                        updateQuery += ', descripcion = ?'
                    
                    } else {
                        updateQuery += 'descripcion = ?'
                    }

                    var descripcion = req.body.descripcion
                    data.push(descripcion)              
                    changes.descripcion = descripcion
                    affectedFields ++
                }
            }

            if (req.body.status === 0 || req.body.status === 1) {
                if (req.body.status != area[0].status) {
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

                database.query(`UPDATE areas SET ${updateQuery} WHERE IDAreas = ?`, data, (error, updated, fields) => {
                    if (error) {
                        response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                        
                    } else if (!affectedFields) {
                        response.error(req, res, 400, `[DB] UPDATED ROWS = 0`, '[NO CHANGES]', 'No hay cambios registrados.')
                        
                    } else if (active) {
                        response.success(req, res, 200, `[DB] UPDATED ${updated.affectedRows} ROW/S; STATUS`, '[STATUS UPDATE]', `El ${area[0].nombre} paso de estar ${preactive} a ${active}!`)
                        
                    } else {    
                        response.success(req, res, 200, `[DB] UPDATED ${updated.affectedRows} ROW/S; ${affectedFields} FIELD/S`, '[UPDATED]', changes)
                    }
                })
            }
        }
    })
})

//      -----------------------------  ELIMINAR AREAS  -----------------------------

router.delete('/:id', (req, res) => {
    const id = req.params.id

    const selectQuery = 'SELECT * FROM areas WHERE IDAreas = ?'
    const deleteQuery = 'DELETE FROM areas WHERE IDAreas = ?'

    database.query(selectQuery, [id], (error, area, fields) => {
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]')
            
        } else {

            database.query(deleteQuery, [id], (error, deleted, fields) => {
        
                if (error) {
                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
                
                } else if (!area[0]) {
                    response.error(req, res, 400, `[DB] SELECTED = ${error}`, '[BAD REQUEST]', 'El area que quiere eliminar no existe...')
               
                } else {
                    response.success(req, res, 200, `[DB] DELETED ${deleted.affectedRows} ROW/S`, '[DELETED]', `${area[0].nombre} eliminada exitosamente!`)
                }
            })
        }
    })
})

module.exports = router