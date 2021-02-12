const express = require('express')
const router = express.Router()
const response = require('../../network/response')
const database = require('../../db')
const model = require('./model')
const encrypt = require('../../components/encryption').encrypt
const badPlanId = "Error: ER_NO_REFERENCED_ROW_2: Cannot add or update a child row: a foreign key constraint fails (`vigo`.`empresas`, CONSTRAINT `planesEmpresas` FOREIGN KEY (`planesID`) REFERENCES `planes` (`IDPlanes`) ON DELETE NO ACTION ON UPDATE NO ACTION)"
const badDirectiva = "Error: ER_NO_REFERENCED_ROW_2: Cannot add or update a child row: a foreign key constraint fails (`vigo`.`personal`, CONSTRAINT `directivaPersonal` FOREIGN KEY (`directivaID`) REFERENCES `directiva` (`IDDirectiva`) ON DELETE NO ACTION ON UPDATE NO ACTION)"

//      ----------------------------  REGISTRAR PERSONAL   ----------------------------

router.post('/', (req, res) => {
    const empleado = {
        nombre: req.body.nombre,
        identificacion: req.body.identificacion,
        usuario: req.body.usuario,
        clave: req.body.clave,
        telefono: req.body.telefono,
        email: req.body.email,
        direccion: req.body.direccion,
        area: req.body.area,
        cargo: req.body.cargo,
        directiva: req.body.directiva
    }

    const duplicatedIdentify = `Error: ER_DUP_ENTRY: Duplicate entry '${empleado.nombre}' for key 'identificacion'`
    const duplicatedUser = `Error: ER_DUP_ENTRY: Duplicate entry '${empleado.nombre}' for key 'usuario'`
    const duplicatedEmail = `Error: ER_DUP_ENTRY: Duplicate entry '${empleado.nombre}' for key 'email'`

    const insertQuery = 'INSERT INTO personal SET ?'
    const selectAreaQuery = 'SELECT * FROM areas WHERE IDAreas = ?'
    const selectCargosQuery = 'SELECT * FROM cargos WHERE IDCargos = ?'
    const selectDirectivaQuery = 'SELECT * FROM directiva WHERE IDDirectiva = ?'
    
    if (!empleado.nombre || !empleado.identificacion || !empleado.usuario || !empleado.clave || !empleado.telefono || !empleado.email || !empleado.direccion || !empleado.area || !empleado.cargo) {
        response.error(req, res, 400, '[DB] INCOMPLETED DATA', '[INCOMPLETED DATA]', 'Datos incompletos...')
    
    } else {
        empleado.clave = encrypt(req.body.clave)
        const newEmpleado = model(empleado)
   
        database.query(selectAreaQuery, empleado.area, (error, area, fields) => {
            if (error) {
                response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
           
            } else {
                database.query(selectCargosQuery, empleado.cargo, (error, cargo, fields) => {
                    if (error) {
                        response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                   
                    } else {

                        database.query(insertQuery, newEmpleado, (error, inserted, fields) => {
                            if (error) {
                                if (error == duplicatedIdentify) {
                                    response.error(req, res, 400, `[DB] DUPLICATED IDENTIFY ${empleado.identificacion}`, '[EXISTING USER]', `El usuario ${empleado.usuario} ya esta registrado...`)
                            
                                } else if (error == duplicatedUser) {
                                    response.error(req, res, 400, `[DB] DUPLICATED USER ${empleado.usuario}`, '[EXISTING USER]', `El usuario ${empleado.usuario} ya esta registrado...`)
                            
                                } else if (error == duplicatedEmail) {
                                    response.error(req, res, 400, `[DB] DUPLICATED EMAIL ${empleado.email}`, '[EXISTING USER]', `El usuario ${empleado.usuario} ya esta registrado...`)
                            
                                } else if (error == badPlanId) {
                                    response.error(req, res, 400, `[DB] INVALID PLAN`, '[BAD REQUEST]', 'El plan seleccionado es invalido...')
                                
                                } else {
                                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                                }
            
                            } else {

                                if (cargo[0].status == 0) {

                                    database.query('UPDATE cargos SET status = ? WHERE IDCargos = ?', [1, empleado.cargo], (error, result, fields) => {
                                        if (error) {
                                            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                                            
                                        } else {

                                            if (req.body.directiva) {                            
                                                database.query(selectDirectivaQuery, empleado.directiva, (error, directiva, fields) => {
                                                    if (error) {
                                                        response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                                                    
                                                    } else {
                                                        response.success(req, res, 201, `[DB] INSERTED ${inserted.affectedRows} ROW/S, ID = ${inserted.insertId}`, '[REGISTERED]', `Empleado/a ${empleado.nombre} registrado/a con el cargo ${cargo[0].nombre} en el area ${area[0].nombre} con el puesto directivo ${directiva[0].cargo}`)
                                                    }
                                                })
            
                                            } 
                                        }
                                    })
                                }

                                response.success(req, res, 201, `[DB] INSERTED ${inserted.affectedRows} ROW/S, ID = ${inserted.insertId}`, '[REGISTERED]', `Empleado/a ${empleado.nombre} registrado/a con el cargo ${cargo[0].nombre} en el area ${area[0].nombre}`)
                            }
                        })
                    }    
                })
            }
        })
    }
})

//      ------------------------------  LISTAR PERSONAL  ------------------------------

router.get('/', (req, res) => {
    var lista = []
    var nameList = []

    const query = `SELECT p.nombre, c.nombre AS cargo, a.nombre AS area
                   FROM personal AS p
                   JOIN cargos AS c
                   ON p.cargosID = c.IDCargos
                   JOIN areas AS a
                   ON p.areasID = a.IDAreas
                   ORDER BY area`

    database.query(query, (error, list, fields) => {
        
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
        
        } else {

            for (let i = 0; i < list.length; i++) {
                nameList.push(list[i].nombre)
            }
            
            for (let i = 0; i < list.length; i++) {
                lista.push(list[i])
            }

            response.success(req, res, 200, `[DB] SELECTED = ${nameList}`, '[LISTED]', lista)
        }
    })
})

//      ------------------------------  TRAER PERSONAL   ------------------------------

router.get('/:id', (req, res) => {
    const id = req.params.id
    const query = `SELECT p.nombre, p.identificacion, p.usuario, p.telefono, p.email, p.direccion, p.status, p.directivaID AS directiva, c.nombre AS cargo, a.nombre AS area
                   FROM personal AS p
                   JOIN cargos AS c
                   ON p.cargosID = c.IDCargos
                   JOIN areas AS a
                   ON p.areasID = a.IDAreas
                   WHERE IDPersonal = ?`

    database.query(query, [id], (error, result, fields) => {

        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salió mal :(')
        
        } else if (!result[0]) {
            response.error(req, res, 404, `[BAD REQUEST]: ID = ${id}`, '[BAD REQUEST]', 'El empleado que esta buscando no existe...')

        } else {

            
            if (result[0].status) {
                var status = 'activo'
            } else {
                var status = 'inactivo'
            }
            
            const empleado = {
                nombre: result[0].nombre,
                identificacion: result[0].identificacion,
                usuario: result[0].usuario,
                telefono: result[0].telefono,
                email: result[0].email,
                direccion: result[0].direccion,
                status: status,
                cargo: result[0].cargo,
                area: result[0].area,
            }
            
            if (result[0].directiva) {
                empleado.extra = 'Es miembro de la directiva'
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

    const selectQuery = `SELECT p.nombre, p.telefono, p.direccion, p.status, p.cargosID AS cargo, p.areasID AS area, p.directivaID AS directiva, d.cargo AS puesto
                         FROM personal AS p 
                         LEFT JOIN directiva AS d 
                         ON p.directivaID = d.IDDirectiva
                         WHERE IDPersonal = ?`

    database.query(selectQuery, [id], (error, empleado, fields) => {
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
        
        } else if (req.body.status > 1) {
            response.error(req, res, 400, `[DB] BAD STATUS VALUE = ${status}`, '[BAD REQUEST]', 'La casilla "status" solo puede estar activa o inactiva...')
        
        } else if (!empleado[0]) {
            response.error(req, res, 400, `[DB] SELECTED = ${empleado[0]}`, '[BAD REQUEST]', 'El empleado que esta buscando no existe...')
            
        } else {
            
            if (req.body.nombre) {
                if (req.body.nombre != empleado[0].nombre) {
                    var nombre = req.body.nombre
                    updateQuery = 'nombre = ?'
                    data.push(nombre) 
                    changes.nombre = nombre
                    affectedFields ++
                }
            } 
            
            if (req.body.telefono) {
                if (req.body.telefono != empleado[0].telefono) {
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

            if (req.body.direccion) {
                if (req.body.direccion != empleado[0].direccion) {
                    if (data.length == 0) {
                        updateQuery += 'direccion = ?'
                    
                    } else {
                        updateQuery += ', direccion = ?'
                    }

                    var direccion = req.body.direccion
                    data.push(direccion)              
                    changes.direccion = direccion
                    affectedFields ++
                }
            }
            
            if (req.body.cargo) {
                if (req.body.cargo != empleado[0].cargo) {
                    if (data.length == 0) {
                        updateQuery += 'cargoID = ?'
                    
                    } else {
                        updateQuery += ', cargoID = ?'
                    }

                    var cargo = req.body.cargo
                    data.push(cargo)              
                    changes.cargo = cargo
                    affectedFields ++
                }
            }

            if (req.body.area) {
                if (req.body.area != empleado[0].area) {
                    if (data.length == 0) {
                        updateQuery += 'areaID = ?'
                    
                    } else {
                        updateQuery += ', areaID = ?'
                    }

                    var area = req.body.area
                    data.push(area)              
                    changes.area = area
                    affectedFields ++
                }
            }

            if (req.body.status === 0 || req.body.status === 1) {
                if (req.body.status != empleado[0].status) {
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

            if (req.body.directiva) {
                if (req.body.directiva != empleado[0].directiva) {
                    var directiva = req.body.directiva
                    
                    updateQuery = 'directivaID = ?'
                    data.push(directiva)
                    changes.directiva = directiva
                    affectedFields ++
                }
            }
            data.push(id)
            
            if (data.length == 1) {
                response.error(req, res, 400, `[DB] UPDATED ROWS = 0`, '[NO CHANGES]', 'No hay cambios registrados.')
            } else {

                database.query(`UPDATE personal SET ${updateQuery} WHERE IDPersonal = ?`, data, (error, updated, fields) => {
                    if (error) {
                        if (error == badDirectiva) {
                            response.error(req, res, 400, `[DB] UPDATED ROWS = 0`, '[BAD REQUEST]', 'La directiva que quiere asignar no existe...')
                        
                        } else {
                            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                        }
                        
                    } else if (!affectedFields) {
                        response.error(req, res, 400, `[DB] UPDATED ROWS = 0`, '[NO CHANGES]', 'No hay cambios registrados.')
                        
                    } else if (active) {
                        response.success(req, res, 200, `[DB] UPDATED ${updated.affectedRows} ROW/S; STATUS`, '[STATUS UPDATE]', `El empleado ${empleado[0].nombre} paso de estar ${preactive} a ${active}!`)
                        
                    } else if (req.body.directiva) {

                        database.query('SELECT * FROM directiva WHERE IDDirectiva = ?', directiva, (error, result, fields) => {
                            if (error) {
                                response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                        
                            } else {
                                response.success(req, res, 200, `[DB] UPDATED ${updated.affectedRows} ROW/S; DIRECTIVE`, '[DIRECTIVE UPDATE]', `El empleado ahora es ${result[0].cargo}!`)
                            }
                        })
                        
                    } else {    
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

    const selectQuery = 'SELECT * FROM personal WHERE IDPersonal = ?'
    const deleteQuery = 'DELETE FROM personal WHERE IDPersonal = ?'

    database.query(selectQuery, [id], (error, empleado, fields) => {
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]')
            
        } else {

            database.query(deleteQuery, [id], (error, deleted, fields) => {
                if (error) {
                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
                
                } else if (!empleado[0]) {
                    response.error(req, res, 400, `[DB] SELECTED = ${error}`, '[BAD REQUEST]', 'El empleado que esta buscando no existe...')
               
                } else {
                    
                    database.query('SELECT * FROM personal WHERE cargosID = ?', empleado[0].cargosID, (error, personal, fields) => {
                        if (error) {
                            response.error(req, res, 500, `[DB] ERROR1 = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
                
                        } else {
                            
                            if (!personal[0]) {

                                database.query('UPDATE cargos SET status = 0 WHERE IDCargos = ?', [empleado[0].cargosID], (error, result, fields) => {
                                    if (error) {
                                        response.error(req, res, 500, `[DB] ERROR2 = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
                  
                                    }
                                })
                            }
                        }
                    })

                    response.success(req, res, 200, `[DB] DELETED ${deleted.affectedRows} ROW/S`, '[DELETED]', `${empleado[0].nombre} eliminado/a exitosamente!`)
                }
            })
        }
    })
})

module.exports = router