const express = require('express')
const router = express.Router()
const response = require('../../network/response')
const database = require('../../db')
const model = require('./model')

//      ----------------------------  REGISTRAR PERSONAL   ----------------------------

router.post('/', (req, res) => {
    const contacto = {
        nombre: req.body.nombre,
        identificacion: req.body.identificacion,
        telefono: req.body.telefono,
        email: req.body.email,
        empresa: req.body.empresa,
        proveedor: req.body.proveedor
    }

    const duplicatedIdentify = `Error: ER_DUP_ENTRY: Duplicate entry '${contacto.nombre}' for key 'identificacion'`
    const duplicatedEmail = `Error: ER_DUP_ENTRY: Duplicate entry '${contacto.nombre}' for key 'email'`

    const insertQuery = 'INSERT INTO contactos SET ?'
    const selectEmpresaQuery = 'SELECT * FROM empresas WHERE IDEmpresas = ?'
    const selectProveedorQuery = 'SELECT * FROM proveedores WHERE IDProveedores = ?'
    
    if (!contacto.nombre || !contacto.identificacion || !contacto.telefono || !contacto.email) {
        response.error(req, res, 400, '[DB] INCOMPLETED DATA', '[INCOMPLETED DATA]', 'Datos incompletos...')
    
    } else {
        const newEmpleado = model(contacto)
        
        database.query(insertQuery, newEmpleado, (error, inserted, fields) => {
            if (error) {
                if (error == duplicatedIdentify) {
                    response.error(req, res, 400, `[DB] DUPLICATED IDENTIFY ${contacto.identificacion}`, '[EXISTING USER]', `El usuario ${contacto.usuario} ya esta registrado...`)
            
                } else if (error == duplicatedEmail) {
                    response.error(req, res, 400, `[DB] DUPLICATED EMAIL ${contacto.email}`, '[EXISTING USER]', `El usuario ${contacto.usuario} ya esta registrado...`)
            
                }  else {
                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                }

            } else {
                if (contacto.empresa && contacto.proveedor) {
                    database.query(selectEmpresaQuery, contacto.empresa, (error, empresa, field) => {
                        if (error) {
                            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                
                        } else {
                            database.query(selectProveedorQuery, contacto.proveedor, (error, proveedor, fields) => {
                                if (error) {
                                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                
                                } else {
                                    response.success(req, res, 201, `[DB] INSERTED ${inserted.affectedRows} ROW/S, ID = ${inserted.insertId}`, '[REGISTERED]', `El contacto ${contacto.nombre} fue registrado/a para la empresa ${empresa[0].nombre} y el proveedor ${proveedor[0].nombre}`)
                                }
                            })
                        }
                    })

                } else if (contacto.empresa) {
                    database.query(selectEmpresaQuery, contacto.empresa, (error, empresa, fields) => {
                        if (error) {
                            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
        
                        } else {
                            response.success(req, res, 201, `[DB] INSERTED ${inserted.affectedRows} ROW/S, ID = ${inserted.insertId}`, '[REGISTERED]', `El contacto ${contacto.nombre} fue registrado/a para la empresa ${empresa[0].nombre} exiosamente!`)
                        }
                    })

                } else {
                    database.query(selectProveedorQuery, contacto.proveedor, (error, proveedor, fields) => {
                        if (error) {
                            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
        
                        } else {
                            response.success(req, res, 201, `[DB] INSERTED ${inserted.affectedRows} ROW/S, ID = ${inserted.insertId}`, '[REGISTERED]', `El contacto ${contacto.nombre} fue registrado/a para el proveedor ${proveedor[0].nombre} exiosamente!`)
                        }
                    })
                }
            }
        })
    }
})

//      ------------------------------  LISTAR PERSONAL  ------------------------------

router.get('/', (req, res) => {
    var lista = []
    var nameList = []

    const query = `SELECT c.nombre, e.nombre AS empresa, p.nombre AS proveedor
                   FROM contactos AS c
                   LEFT JOIN empresas AS e
                   ON c.empresasID = e.IDEmpresas
                   LEFT JOIN proveedores AS p
                   ON c.proveedoresID = p.IDProveedores`

    database.query(query, (error, list, fields) => {
        
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
        
        } else {

            for (let i = 0; i < list.length; i++) {
                nameList.push(list[i].nombre)
            }
            
            for (let i = 0; i < list.length; i++) {
                var contacto = {}

                if (list[i].empresa && list[i].proveedor) {
                    contacto = {
                        nombre: list[i].nombre,
                        empresa: list[i].empresa,
                        proveedor: list[i].proveedor
                    }

                } else if (list[i].empresa) {
                    contacto = {
                        nombre: list[i].nombre,
                        empresa: list[i].empresa
                    }

                } else {
                    contacto = {
                        nombre: list[i].nombre,
                        proveedor: list[i].proveedor
                    }
                }
                lista.push(contacto)
            }

            response.success(req, res, 200, `[DB] SELECTED = ${nameList}`, '[LISTED]', lista)
        }
    })
})

//      ------------------------------  TRAER PERSONAL   ------------------------------

router.get('/:id', (req, res) => {
    const id = req.params.id
    const query = `SELECT c.nombre, c.identificacion, c.telefono, c.email, c.status, e.nombre AS empresa, p.nombre AS proveedor
                   FROM contactos AS c
                   LEFT JOIN empresas AS e
                   ON c.empresasID = e.IDEmpresas
                   LEFT JOIN proveedores AS p
                   ON c.proveedoresID = p.IDProveedores
                   WHERE IDContactos = ?`

    database.query(query, [id], (error, result, fields) => {

        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salió mal :(')
        
        } else if (!result[0]) {
            response.error(req, res, 404, `[BAD REQUEST]: ID = ${id}`, '[BAD REQUEST]', 'El contacto que intenta encontrar no existe...')

        } else {

            if (result[0].status) {
                var status = 'activo'
            } else {
                var status = 'inactivo'
            }
            
            if (result[0].empresa && result[0].proveedor) {
                var empleado = {
                    nombre: result[0].nombre,
                    identificacion: result[0].identificacion,
                    telefono: result[0].telefono,
                    email: result[0].email,
                    empresa: result[0].empresa,
                    proveedor: result[0].proveedor,
                    status: status,
                }

            } else if (result[0].empresa) {
                var empleado = {
                    nombre: result[0].nombre,
                    identificacion: result[0].identificacion,
                    telefono: result[0].telefono,
                    email: result[0].email,
                    empresa: result[0].empresa,
                    status: status,
                }

            } else {
                var empleado = {
                    nombre: result[0].nombre,
                    identificacion: result[0].identificacion,
                    telefono: result[0].telefono,
                    email: result[0].email,
                    proveedor: result[0].proveedor,
                    status: status,
                }
            }

            response.success(req, res, 200, `[DB] SELECTED = ${empleado.nombre}`, '[SELECTED]', empleado)
        }
    })
})

//      ----------------------------  ACTUALIZAR PERSONAL  ----------------------------

router.patch('/:id', (req, res) => {
    const id = req.params.id

    const changes = {}
    var affectedFields = ''
    var updateQuery = ''
    var data = []

    const selectQuery = `SELECT * FROM contactos WHERE IDContactos = ?`

    database.query(selectQuery, [id], (error, contacto, fields) => {

        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
        
        } else if (req.body.status > 1) {
            response.error(req, res, 400, `[DB] BAD STATUS VALUE = ${status}`, '[BAD REQUEST]', 'La casilla "status" solo puede estar activa o inactiva...')
        
        } else if (!contacto[0]) {
            response.error(req, res, 400, `[DB] SELECTED = ${contacto[0]}`, '[BAD REQUEST]', 'El contacto que esta buscando no existe...')
            
        } else {
            
            if (req.body.nombre) {
                if (req.body.nombre != contacto[0].nombre) {
                    var nombre = req.body.nombre
                    updateQuery = 'nombre = ?'
                    data.push(nombre) 
                    changes.nombre = nombre
                    affectedFields ++
                }
            } 
            
            if (req.body.telefono) {
                if (req.body.telefono != contacto[0].telefono) {
                    if (data.length == 0) {
                        updateQuery += 'telefono = ?'
                    
                    } else {
                        updateQuery += ', telefono = ?'
                    }

                    var telefono = req.body.telefono
                    data.push(telefono)              
                    changes.telefono = telefono
                    affectedFields ++
                }
            }

            if (req.body.status === 0 || req.body.status === 1) {
                if (req.body.status != contacto[0].status) {
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

                database.query(`UPDATE contactos SET ${updateQuery} WHERE IDContactos = ?`, data, (error, updated, fields) => {
                    if (error) {  
                        response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                        
                    } else if (!affectedFields) {
                        response.error(req, res, 400, `[DB] UPDATED ROWS = 0`, '[NO CHANGES]', 'No hay cambios registrados.')
                        
                    } else if (active) {
                        response.success(req, res, 200, `[DB] UPDATED ${updated.affectedRows} ROW/S; STATUS`, '[STATUS UPDATE]', `El contacto ${contacto[0].nombre} paso de estar ${preactive} a ${active}!`)
                        
                    }  else {    
                        response.success(req, res, 200, `[DB] UPDATED ${updated.affectedRows} ROW/S; ${affectedFields} FIELD/S`, '[UPDATED]', changes)
                    }
                })
            }
        }
    })
})

//      -----------------------------  ELIMINAR PERSONAL  -----------------------------

router.delete('/:id', (req, res) => {
    const id = req.params.id

    const selectQuery = 'SELECT * FROM contactos WHERE IDContactos = ?'
    const deleteQuery = 'DELETE FROM contactos WHERE IDContactos = ?'

    database.query(selectQuery, [id], (error, contacto, fields) => {
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]')
            
        } else {

            database.query(deleteQuery, [id], (error, deleted, fields) => {
        
                if (error) {
                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
                
                } else if (!contacto[0]) {
                    response.error(req, res, 400, `[DB] SELECTED = ${error}`, '[BAD REQUEST]', 'El contacto que esta buscando no existe...')
               
                } else {
                    response.success(req, res, 200, `[DB] DELETED ${deleted.affectedRows} ROW/S`, '[DELETED]', `${contacto[0].nombre} eliminado/a exitosamente! de los contactos`)
                }
            })
        }
    })
})

module.exports = router