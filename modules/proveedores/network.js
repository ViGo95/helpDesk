const express = require('express')
const router = express.Router()
const response = require('../../network/response')
const database = require('../../db')
const model = require('./model')
const encrypt = require('../../components/encryption').encrypt

//      ----------------------------  REGISTRAR EMPRESAS   ----------------------------

router.post('/', (req, res) => {
    const proveedor = {
        nombre: req.body.nombre,
        usuario: req.body.usuario,
        clave: req.body.clave,
        descripcion: req.body.descripcion,
        direccion: req.body.direccion
    }

    const duplicatedUser = `Error: ER_DUP_ENTRY: Duplicate entry '${proveedor.nombre}' for key 'usuario'`

    const query = 'INSERT INTO proveedores SET ?'
    
    if (!proveedor.nombre || !proveedor.usuario || !proveedor.clave || !proveedor.direccion) {
        response.error(req, res, 400, '[DB] INCOMPLETED DATA', '[INCOMPLETED DATA]', 'Datos incompletos...')
    
    } else {
        proveedor.clave = encrypt(req.body.clave)
        const newProveedor = model(proveedor)
    
        database.query(query, newProveedor, (error, inserted, fields) => {
            if (error) {
                if (error == duplicatedUser) {
                    response.error(req, res, 400, `[DB] DUPLICATED USER ${proveedor.usuario}`, '[EXISTING USER]', `El usuario ${proveedor.usuario} ya esta registrado...`)
                
                } else {
                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                }

            } else {
                response.success(req, res, 201, `[DB] INSERTED ${inserted.affectedRows} ROW/S, ID = ${inserted.insertId}`, '[REGISTERED]', `Proveedor ${proveedor.nombre} fue registrado exitosamente`)
            }
        })   
    }
})

//      ------------------------------  LISTAR EMPRESAS  ------------------------------

router.get('/', (req, res) => {
    var lista = []

    const query = 'SELECT * FROM proveedores'

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
    const query = `SELECT * FROM proveedores WHERE IDProveedores = ?`

    database.query(query, [id], (error, result, fields) => {

        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salió mal :(')
        
        } else if (!result[0]) {
            response.error(req, res, 404, `[BAD REQUEST]: ID = ${id}`, '[BAD REQUEST]', 'La proveedor seleccionada es invalida...')

        } else {

            if (result[0].status) {
                var status = 'activo'
            } else {
                var status = 'inactivo'
            }

            const proveedor = {
            nombre: result[0].nombre,
            usuario: result[0].usuario,
            descripcion: result[0].descripcion,
            direccion: result[0].direccion,
            status: status,
            }

            response.success(req, res, 200, `[DB] SELECTED = ${proveedor.nombre}`, '[SELECTED]', proveedor)
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

    const selectQuery = 'SELECT * FROM proveedores WHERE IDProveedores = ?'
    
    database.query(selectQuery, [id], (error, proveedor, fields) => {
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
        
        } else if (req.body.status > 1) {
            response.error(req, res, 400, `[DB] BAD STATUS VALUE = ${status}`, '[BAD REQUEST]', 'La casilla "status" solo puede estar activa o inactiva...')
        
        } else if (!proveedor[0]) {
            response.error(req, res, 400, `[DB] SELECTED = ${proveedor[0]}`, '[BAD REQUEST]', 'El proveedor que esta buscando no existe...')
            
        } else {
            
            if (req.body.descripcion) {
                if (req.body.descripcion != proveedor[0].descripcion) {
                    var descripcion = req.body.descripcion
                    updateQuery = 'descripcion = ?'
                    data.push(descripcion) 
                    changes.descripcion = descripcion
                    affectedFields ++
                }
            } 
            
            if (req.body.direccion) {
                if (req.body.direccion != proveedor[0].direccion) {
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

            if (req.body.status === 0 || req.body.status === 1) {
                if (req.body.status != proveedor[0].status) {
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

                database.query(`UPDATE proveedores SET ${updateQuery} WHERE IDProveedores = ?`, data, (error, updated, fields) => {
                    if (error) {
                        response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                        
                    } else if (!affectedFields) {
                        response.error(req, res, 400, `[DB] UPDATED ROWS = 0`, '[NO CHANGES]', 'No hay cambios registrados.')
                        
                    } else if (active) {
                        response.success(req, res, 200, `[DB] UPDATED ${updated.affectedRows} ROW/S; STATUS`, '[STATUS UPDATE]', `El proveedor ${proveedor[0].nombre} paso de estar ${preactive} a ${active}!`)
                        
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

    const selectQuery = 'SELECT * FROM proveedores WHERE IDProveedores = ?'
    const deleteQuery = 'DELETE FROM proveedores WHERE IDProveedores = ?'

    database.query(selectQuery, [id], (error, proveedor, fields) => {
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]')
            
        } else {

            database.query(deleteQuery, [id], (error, deleted, fields) => {
        
                if (error) {
                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
                
                } else if (!proveedor[0]) {
                    response.error(req, res, 400, `[DB] SELECTED = ${error}`, '[BAD REQUEST]', 'El proveedor seleccionada es invalida...')
               
                } else {
                    response.success(req, res, 200, `[DB] DELETED ${deleted.affectedRows} ROW/S`, '[DELETED]', `${proveedor[0].nombre} fue eliminado exitosamente!`)
                }
            })
        }
    })
})

module.exports = router