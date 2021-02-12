const express = require('express')
const router = express.Router()
const response = require('../../network/response')
const database = require('../../db')
const model = require('./model')
const badProvId = "Error: ER_NO_REFERENCED_ROW_2: Cannot add or update a child row: a foreign key constraint fails (`vigo`.`recursos`, CONSTRAINT `proveedoresRecursos` FOREIGN KEY (`proveedoresID`) REFERENCES `proveedores` (`IDProveedores`) ON DELETE NO ACTION ON UPDATE NO ACTION)"

//      ----------------------------  REGISTRAR SERVICIOS   ----------------------------

router.post('/', (req, res) => {
    const recurso = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        cantidad: req.body.cantidad,
        proveedor: req.body.proveedor
    }
    const selectQuery = 'SELECT * FROM proveedores WHERE IDProveedores = ?'
    const insertQuery = 'INSERT INTO recursos SET ?'
    
    if (!recurso.nombre) {
        response.error(req, res, 400, '[DB] INCOMPLETED DATA', '[INCOMPLETED DATA]', 'Datos incompletos...')
    
    } else {
        const newRecurso = model(recurso)
        
        database.query(selectQuery, recurso.proveedor, (error, proveedor, fields) => {
            if (error) {
                response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
           
            } else {
                database.query(insertQuery, newRecurso, (error, inserted, fields) => {
                    if (error) {
                        if (error == badProvId) {
                            response.error(req, res, 400, `[DB] INVALID AREA`, '[BAD REQUEST]', 'El proveedor que selecciono no existe...')
                        
                        } else {
                            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                        }
    
                    } else {
                        if (proveedor[0]) {
                            response.success(req, res, 201, `[DB] INSERTED ${inserted.affectedRows} ROW/S, ID = ${inserted.insertId}`, '[REGISTERED]', `Nuevo recurso ${recurso.nombre} ingresado, suministrado por ${proveedor[0].nombre}`)

                        } else {
                            response.success(req, res, 201, `[DB] INSERTED ${inserted.affectedRows} ROW/S, ID = ${inserted.insertId}`, '[REGISTERED]', `Nuevo recurso ${recurso.nombre} ingresado`)
                        }
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

    const query = `SELECT r.nombre, p.nombre AS proveedor 
                   FROM recursos AS r 
                   LEFT JOIN proveedores AS p 
                   ON r.proveedoresID = p.IDProveedores`

    database.query(query, (error, list, fields) => {
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
        
        } else {

            for (let i = 0; i < list.length; i++){
                nameList.push(list[i].nombre)
            }
            
            for (let i = 0; i < list.length; i++) {
                var recurso = {
                    nombre: list[i].nombre,
                }

                if (list[i].proveedor) {
                    recurso.proveedor = list[i].proveedor
                }
                lista.push(recurso)
            }

            response.success(req, res, 200, `[DB] SELECTED = ${nameList}`, '[LISTED]', lista)
        }
    })
})

//      ------------------------------  TRAER SERVICIOS   ------------------------------

router.get('/:id', (req, res) => {
    const id = req.params.id
    const query = `SELECT r.nombre, r.descripcion, r.cantidad, r.status, p.nombre AS proveedor 
                   FROM recursos AS r 
                   LEFT JOIN proveedores AS p 
                   ON r.proveedoresID = p.IDProveedores
                   WHERE IDRecursos = ?`

    database.query(query, [id], (error, result, fields) => {
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salió mal :(')
        
        } else if (!result[0]) {
            response.error(req, res, 404, `[DB] BAD REQUEST ID = ${id}`, '[BAD REQUEST]', 'El recurso que esta buscando no existe...')

        } else {

            if (result[0].status) {
                var status = 'activo'
            } else {
                var status = 'inactivo'
            }

            const recurso = {
            nombre: result[0].nombre,
            descripcion: result[0].descripcion,
            cantidad: result[0].cantidad,
            status: status,
            proveedor: result[0].proveedor,
            }

            response.success(req, res, 200, `[DB] SELECTED = ${recurso.nombre}`, '[SELECTED]', recurso)
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

    const selectQuery = 'SELECT * FROM recursos WHERE IDRecursos = ?'
    
    database.query(selectQuery, [id], (error, recurso, fields) => {
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
        
        } else if (req.body.status > 1) {
            response.error(req, res, 400, `[DB] BAD STATUS VALUE = ${status}`, '[BAD REQUEST]', 'La casilla "status" solo puede estar activa o inactiva...')
        
        } else if (!recurso[0]) {
            response.error(req, res, 400, `[DB] SELECTED = ${recurso[0]}`, '[BAD REQUEST]', 'El recurso que esta buscando no existe...')
            
        } else {
            
            if (req.body.descripcion) {
                if (req.body.descripcion != recurso[0].descripcion) {
                    var descripcion = req.body.descripcion
                    updateQuery = 'descripcion = ?'
                    data.push(descripcion) 
                    changes.descripcion = descripcion
                    affectedFields ++
                }
            } 
            
            if (req.body.cantidad) {
                if (req.body.cantidad != recurso[0].cantidad) {
                    if (data.length == 1) {
                        updateQuery += ', cantidad = ?'
                    
                    } else {
                        updateQuery += 'cantidad = ?'
                    }

                    var cantidad = req.body.cantidad
                    data.push(cantidad)              
                    changes.cantidad = cantidad
                    affectedFields ++
                }
            }

            if (req.body.status === 0 || req.body.status === 1) {
                if (req.body.status != recurso[0].status) {
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

                database.query(`UPDATE recursos SET ${updateQuery} WHERE IDRecursos = ?`, data, (error, updated, fields) => {
                    if (error) {
                        response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                        
                    } else if (!affectedFields) {
                        response.error(req, res, 400, `[DB] UPDATED ROWS = 0`, '[NO CHANGES]', 'No hay cambios registrados.')
                        
                    } else if (active) {
                        response.success(req, res, 200, `[DB] UPDATED ${updated.affectedRows} ROW/S; STATUS`, '[STATUS UPDATE]', `El recurso ${recurso[0].nombre} paso de estar ${preactive} a ${active}!`)
                        
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

    const selectQuery = 'SELECT * FROM recursos WHERE IDRecursos = ?'
    const deleteQuery = 'DELETE FROM recursos WHERE IDRecursos = ?'

    database.query(selectQuery, [id], (error, recurso, fields) => {
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]')
            
        } else {

            database.query(deleteQuery, [id], (error, deleted, fields) => {
        
                if (error) {
                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
                
                } else if (!recurso[0]) {
                    response.error(req, res, 400, `[DB] SELECTED = ${error}`, '[BAD REQUEST]', 'El recurso que desea eliminar no existe...')
               
                } else {
                    response.success(req, res, 200, `[DB] DELETED ${deleted.affectedRows} ROW/S`, '[DELETED]', `recurso ${recurso[0].nombre} eliminado exitosamente!`)
                }
            })
        }
    })
})

module.exports = router