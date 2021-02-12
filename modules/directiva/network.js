const express = require('express')
const router = express.Router()
const response = require('../../network/response')
const database = require('../../db')
const model = require('./model')

//      ----------------------------  REGISTRAR DIRECTIVAS   ----------------------------

router.post('/', (req, res) => {
    const puesto = {
        cargo: req.body.cargo,
        descripcion: req.body.descripcion,
        bonificacion: req.body.bonificacion
    }
    
    const query = 'INSERT INTO directiva SET ?'
    
    if (!puesto.cargo || !puesto.bonificacion) {
        response.error(req, res, 400, '[DB] INCOMPLETED DATA', '[INCOMPLETED DATA]', 'Datos incompletos...')
    
    } else {
        const newPuesto = model(puesto)

        database.query(query, newPuesto, (error, inserted, fields) => {
            if (error) {
                response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')

            } else {
                response.success(req, res, 201, `[DB] INSERTED ${inserted.affectedRows} ROW/S, ID = ${inserted.insertId}`, '[CREATED]', `Puesto directivo ${puesto.cargo} creado con un bono de ${puesto.bonificacion}$`)
            }
        })
    }
})

//      ------------------------------  LISTAR DIRECTIVAS  ------------------------------

router.get('/', (req, res) => {
    var lista = []
    var dirList = []

    const query = `SELECT p.nombre, d.cargo AS puesto
                   FROM personal AS P
                   JOIN directiva AS d
                   ON p.directivaID = d.IDDirectiva` 

    database.query(query, (error, list, fields) => {
        
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
        
        } else {

            for (let i = 0; i < list.length; i++) {
                dirList.push(list[i].puesto)
            }
            
            for (let i = 0; i < list.length; i++) {
                lista.push(list[i])
            }

            response.success(req, res, 200, `[DB] SELECTED = ${dirList}`, '[LISTED]', lista)
        }
    })
})

//      ------------------------------  TRAER DIRECTIVAS   ------------------------------

router.get('/:id', (req, res) => {
    const id = req.params.id
    const query = `SELECT p.nombre AS directivo, d.cargo, d.descripcion, d.bonificacion, d.status
                   FROM personal AS P
                   JOIN directiva AS d
                   ON p.directivaID = d.IDDirectiva
                   WHERE IDDirectiva = ?` 

    database.query(query, [id], (error, result, fields) => {

        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salió mal :(')
        
        } else if (!result[0]) {
            response.error(req, res, 404, `[BAD REQUEST]: ID = ${id}`, '[BAD REQUEST]', 'El puesto directivo que esta buscando no existe...')

        } else {

            if (result[0].status) {
                var status = 'activo'
            } else {
                var status = 'inactivo'
            }

            const puesto = {
            directivo: result[0].directivo,
            cargo: result[0].cargo,
            descripcion: result[0].descripcion,
            bonificacion: result[0].bonificacion,
            status: status
            }

            response.success(req, res, 200, `[DB] SELECTED = ${puesto.cargo}`, '[SELECTED]', puesto)
        }
    })
})

//      ----------------------------  ACTUALIZAR DIRECTIVAS  ----------------------------

router.patch('/:id', (req, res) => {
    const id = req.params.id

    const changes = {}
    var affectedFields = ''
    var updateQuery = ''
    var data = []

    const selectQuery = 'SELECT * FROM directiva WHERE IDDirectiva = ?'
    
    database.query(selectQuery, [id], (error, puesto, fields) => {
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
        
        } else if (req.body.status > 1) {
            response.error(req, res, 400, `[DB] BAD STATUS VALUE = ${status}`, '[BAD REQUEST]', 'La casilla "status" solo puede estar activa o inactiva...')
        
        } else if (!puesto[0]) {
            response.error(req, res, 400, `[DB] SELECTED = ${puesto[0]}`, '[BAD REQUEST]', 'El puesto que esta buscando no existo...')
            
        } else {
            
            if (req.body.bonificacion) {
                if (req.body.bonificacion != puesto[0].bonificacion) {
                    var bonificacion = req.body.bonificacion
                    updateQuery = 'bonificacion = ?'
                    data.push(bonificacion) 
                    changes.bonificacion = bonificacion
                    affectedFields ++
                }
            }

            if (req.body.status === 0 || req.body.status === 1) {
                if (req.body.status != puesto[0].status) {
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

                database.query(`UPDATE directiva SET ${updateQuery} WHERE IDDirectiva = ?`, data, (error, updated, fields) => {
                    if (error) {
                        response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                        
                    } else if (!affectedFields) {
                        response.error(req, res, 400, `[DB] UPDATED ROWS = 0`, '[NO CHANGES]', 'No hay cambios registrados.')
                        
                    } else if (active) {
                        response.success(req, res, 200, `[DB] UPDATED ${updated.affectedRows} ROW/S; STATUS`, '[STATUS UPDATE]', `El puesto directivo de ${puesto[0].nombre} paso de estar ${preactive} a ${active}!`)
                        
                    } else {    
                        response.success(req, res, 200, `[DB] UPDATED ${updated.affectedRows} ROW/S; ${affectedFields} FIELD/S`, '[UPDATED]', changes)
                    }
                })
            }
        }
    })
})

//      -----------------------------  ELIMINAR DIRECTIVAS  -----------------------------

router.delete('/:id', (req, res) => {
    const id = req.params.id

    const selectQuery = 'SELECT * FROM directiva WHERE IDDirectiva = ?'
    const deleteQuery = 'DELETE FROM directiva WHERE IDDirectiva = ?'

    database.query(selectQuery, [id], (error, puesto, fields) => {
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]')
            
        } else {

            database.query(deleteQuery, [id], (error, deleted, fields) => {
        
                if (error) {
                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
                
                } else if (!puesto[0]) {
                    response.error(req, res, 400, `[DB] SELECTED = ${error}`, '[BAD REQUEST]', 'El puesto que esta buscando no existe...')
               
                } else {
                    response.success(req, res, 200, `[DB] DELETED ${deleted.affectedRows} ROW/S`, '[DELETED]', `El puesto ${puesto[0].cargo} fue eliminado exitosamente!`)
                }
        
            })
        }
    })
})

module.exports = router