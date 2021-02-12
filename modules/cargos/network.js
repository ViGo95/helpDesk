const express = require('express')
const router = express.Router()
const response = require('../../network/response')
const database = require('../../db')
const model = require('./model')

//      ----------------------------  REGISTRAR CARGOS   ----------------------------

router.post('/', (req, res) => {
    const cargo = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        salario: req.body.salario,
        disponibilidad: req.body.disponibilidad,
        activo: req.body.activo
    }

    const duplicatedName = `Error: ER_DUP_ENTRY: Duplicate entry '${cargo.nombre}' for key 'nombre_UNIQUE'`
    
    const query = 'INSERT INTO cargos SET ?'

    if (!cargo.nombre || !cargo.descripcion || !cargo.salario) {
        response.error(req, res, 400, '[DB] INCOMPLETED DATA', '[INCOMPLETED DATA]', 'Datos incompletos...')
    
    } else {
        const newCargo = model(cargo)

        database.query(query, newCargo, (error, inserted, fields) => {
            if (error) {
                if (error == duplicatedName) {
                    response.error(req, res, 400, `[DB] DUPLICATED NAME ${cargo.nombre}`, '[EXISTING NAME]', `El cargo ${cargo.nombre} ya esta registrado...`)
                
                } else {
                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                }

            } else {
                response.success(req, res, 201, `[DB] INSERTED ${inserted.affectedRows} ROW/S, ID = ${inserted.insertId}`, '[CREATED]', `Cargo de ${cargo.nombre} registrado con un salario de ${cargo.salario}$ y disponibilidad ${cargo.disponibilidad}`)
            }
        })
    }
})

//      ------------------------------  LISTAR CARGOS  ------------------------------

router.get('/', (req, res) => {
    var lista = []
    var listaNombres = []

    const query = 'SELECT nombre, salario FROM cargos'

    database.query(query, (error, list, fields) => {
        
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
        
        } else {

            for (let i = 0; i < list.length; i++) {
                listaNombres.push(list[i].nombre)
            }
            
            for (let i = 0; i < list.length; i++) {
                lista.push(list[i])
            }

            response.success(req, res, 200, `[DB] SELECTED = ${listaNombres}`, '[LISTED]', lista)
        }
    })
})

//      ------------------------------  TRAER CARGOS   ------------------------------

router.get('/:id', (req, res) => {
    const id = req.params.id
    const query = 'SELECT * FROM cargos WHERE IDCargos = ?'

    database.query(query, [id], (error, result, fields) => {

        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salió mal :(')
        
        } else if (!result[0]) {
            response.error(req, res, 404, `[BAD REQUEST]: ID = ${id}`, '[BAD REQUEST]', 'El cargo que esta buscando no existe...')

        } else {

            if (result[0].status) {
                var status = 'Asignado'
            } else {
                var status = 'No asignado'
            }

            const cargo = {
            nombre: result[0].nombre,
            descripcion: result[0].descripcion,
            salario: result[0].salario,
            disponibilidad: result[0].disponibilidad,
            status: status
            }

            response.success(req, res, 200, `[DB] SELECTED = ${cargo.nombre}`, '[SELECTED]', cargo)
        }
    })
})

//      ----------------------------  ACTUALIZAR CARGOS  ----------------------------

router.patch('/:id', (req, res) => {
    const id = req.params.id

    const descripcion = req.body.descripcion
    const salario = req.body.salario
    const disponibilidad = req.body.disponibilidad

    const changes = {}
    var affectedFields = ''

    const selectQuery = 'SELECT * FROM cargos WHERE IDCargos = ?'
    const updateQuery = 'UPDATE cargos SET descripcion = ?, salario = ?, disponibilidad = ? WHERE IDCargos = ?'

    if (disponibilidad != 'Baja' && disponibilidad != 'Media' && disponibilidad != 'Alta') {
        response.error(req, res, 400, `[DB] SELECTED = ${disponibilidad}`, '[BAD REQUEST]', "La disponibilidad solo puede ser 'Baja', 'Media' o 'Alta'")
    
    } else {
        database.query(selectQuery, [id], (error, cargo, fields) => {
            
            if (error) {
                response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
            
            } else if (!cargo[0]) {
                response.error(req, res, 400, `[DB] SELECTED = ${cargo[0]}`, '[BAD REQUEST]', 'El cargo que esta buscando no existe...')
           
            } else {
    
                if (descripcion != cargo[0].descripcion) {
                    changes.descripcion = descripcion
                    affectedFields ++
                }

                if (salario != cargo[0].salario) {
                    changes.salario = salario
                    affectedFields ++
                }

                if (disponibilidad != cargo[0].disponibilidad) {
                    changes.disponibilidad = disponibilidad
                    affectedFields ++
                }
    
                database.query(updateQuery, [descripcion, salario, disponibilidad, id], (error, updated, fields) => {
                    if (error) {
                        response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                    
                    } else if (!affectedFields) {
                        response.error(req, res, 400, `[DB] UPDATED ROWS = 0`, '[NO CHANGES]', 'No hay cambios registrados.')
                   
                    } else {    
                        response.success(req, res, 200, `[DB] UPDATED ${updated.affectedRows} ROW/S; ${affectedFields} FIELD/S`, '[UPDATED]', changes)
                    }
                })
            }
        })
    }
})

//      -----------------------------  ELIMINAR CARGOS  -----------------------------

router.delete('/:id', (req, res) => {
    const id = req.params.id

    const selectQuery = 'SELECT * FROM cargos WHERE IDCargos = ?'
    const deleteQuery = 'DELETE FROM cargos WHERE IDCargos = ?'

    database.query(selectQuery, [id], (error, cargo, fields) => {
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]')
            
        } else {
            database.query(deleteQuery, [id], (error, deleted, fields) => {
        
                if (error) {
                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
                
                } else if (!cargo[0]) {
                    response.error(req, res, 400, `[DB] SELECTED = ${error}`, '[BAD REQUEST]', 'El cargo que esta buscando no existe...')
               
                } else {
                    response.success(req, res, 200, `[DB] DELETED ${deleted.affectedRows} ROW/S`, '[DELETED]', `El cargo ${cargo[0].nombre} fue eliminado exitosamente!`)
                }
            })
        }
    })
})

module.exports = router