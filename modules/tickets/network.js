const express = require('express')
const router = express.Router()
const response = require('../../network/response')
const database = require('../../db')
const model = require('./model')
const modelProyecto = require('./proyectos/model')
const modelReporte = require('./reportes/model')
const modelConsulta = require('./consultas/model')
const badServicioId = "Error: ER_NO_REFERENCED_ROW_2: Cannot add or update a child row: a foreign key constraint fails (`vigo`.`tickets`, CONSTRAINT `empresasTickets` FOREIGN KEY (`empresasID`) REFERENCES `empresas` (`IDEmpresas`) ON DELETE NO ACTION ON UPDATE NO ACTION)"

//      ----------------------------  REGISTRAR PERSONAL   ----------------------------

router.post('/', (req, res) => {
    
    const ticket = {
        empresa: req.body.empresa,
        servicio: req.body.servicio,
        proyecto: {
            nombre: req.body.nombreProyecto,
            descripcion: req.body.descripcionProyecto,
            fecha: req.body.fechaProyecto
        } ,
        reporte: {
            descripcion: req.body.descripcionReporte
        },
        consulta: {
            descripcion: req.body.descripcionConsulta,
            fecha: req.body.fechaConsulta
        }
    }
    
    const insertTicketQuery = 'INSERT INTO tickets SET ?'
    const selectEmpresaQuery = 'SELECT * FROM empresas WHERE IDEmpresas = ?'
    var insertTypeQuery = ''
//    const selectProveedorQuery = 'SELECT * FROM proveedores WHERE IDProveedores = ?'
    
    if (!ticket.empresa) {
        response.error(req, res, 400, '[DB] INCOMPLETED DATA', '[INCOMPLETED DATA]', 'Datos incompletos...')
        
    } else {

        database.query(selectEmpresaQuery, ticket.empresa, (error, empresa, fields) => {
            if (error) {
                 response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                
            } else if (!empresa[0]) {
                response.error(req, res, 400, `[DB] BAD REQUEST ID: ${ticket.empresa}`, '[BAD EMPRESA ID]', 'La empresa que quiere hacer el reporte no existe...')
                            
            } else {
                ticketType = {}
                
                if (ticket.proyecto.nombre) {
                    insertTypeQuery = 'INSERT INTO proyectos SET ?'
                    
                    const newProyecto = modelProyecto(ticket.proyecto)
        
                    database.query(insertTypeQuery, newProyecto, (error, result, fields) => {
                        if (error) {
                            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                        
                        } else {

                            fechaProyecto = ticket.proyecto.fecha
                            ticket.reporte = 0
                            ticket.servicio = 0
                            ticket.proyecto = result.insertId
                            ticket.consulta = 0
                            const newTicket = model(ticket)
        
                            database.query(insertTicketQuery, newTicket, (error, inserted, fields) => {
                                if (error) {
                                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')

                                } else {
                                    response.success(req, res, 201, `[DB] INSERTED ${inserted.affectedRows} ROW/S, ID = ${inserted.insertId}`, '[REGISTERED]', `La empresa ${empresa[0].nombre} creo un ticket para levantar un proyecto el dia ${fechaProyecto}! Nro. de ticket: ${inserted.insertId}`)       
                                }
                            })
                        }
                    })
                    
                } else if (ticket.reporte.descripcion) {
                    insertTypeQuery = 'INSERT INTO reportes SET ?'
                    
                    const newReporte = modelReporte(ticket.reporte)
        
                    database.query(insertTypeQuery, newReporte, (error, result, fields) => {
                        if (error) {
                            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                        
                        } else {

                            ticket.reporte = result.insertId
                            ticket.servicio = 0
                            ticket.proyecto = 0
                            ticket.consulta = 0
                            const newTicket = model(ticket)
        
                            database.query(insertTicketQuery, newTicket, (error, inserted, fields) => {
                                if (error) {
                                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')

                                } else {
                                    response.success(req, res, 201, `[DB] INSERTED ${inserted.affectedRows} ROW/S, ID = ${inserted.insertId}`, '[REGISTERED]', `La empresa ${empresa[0].nombre} creo un ticket para reportar una falla! Nro. de ticket: ${inserted.insertId}`)       
                                }
                            })
                        }
                    })
                    
                } else if (ticket.consulta.descripcion) {
                    insertTypeQuery = 'INSERT INTO consultas SET ?'
                    
                    const newConsulta = modelConsulta(ticket.consulta)
        
                    database.query(insertTypeQuery, newConsulta, (error, result, fields) => {
                        if (error) {
                            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                        
                        } else {

                            fechaConsulta = ticket.consulta.fecha
                            ticket.reporte = 0
                            ticket.servicio = 0
                            ticket.proyecto = 0
                            ticket.consulta = result.insertId
                            const newTicket = model(ticket)
        
                            database.query(insertTicketQuery, newTicket, (error, inserted, fields) => {
                                if (error) {
                                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')

                                } else {
                                    response.success(req, res, 201, `[DB] INSERTED ${inserted.affectedRows} ROW/S, ID = ${inserted.insertId}`, '[REGISTERED]', `La empresa ${empresa[0].nombre} creo un ticket para solicitar una consultoria el dia ${fechaConsulta}! Nro. de ticket: ${inserted.insertId}`)       
                                }
                            })
                        }
                    })
                    
                } else {
                    
                    database.query('SELECT * FROM servicios WHERE IDServicios = ?', ticket.servicio, (error, servicio, fields) => {
                        if (error) {
                            if (error == badServicioId) {
                                response.error(req, res, 400, `[DB] SELECTED: ${ticket.servicio}`, '[BAD REQUEST]', 'El servicio que quiere solicitar no existe...')
                
                            } else {
                                response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')
                            }
                            
                        } else {

                            ticket.reporte = 0 
                            ticket.servicio = ticket.servicio
                            ticket.proyecto = 0
                            ticket.consulta = 0

                            const newTicket = model(ticket)
        
                            database.query(insertTicketQuery, newTicket, (error, inserted, fields) => {
                                if (error) {
                                    response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... algo salio mal :(')

                                } else {
                                    response.success(req, res, 201, `[DB] INSERTED ${inserted.affectedRows} ROW/S, ID = ${inserted.insertId}`, '[REGISTERED]', `La empresa ${empresa[0].nombre} creo un ticket para solicitar ${servicio[0].nombre}! Nro. de ticket: ${inserted.insertId}`)       
                                }
                            })
                        }
                    })
                }
            }
        })
    }
})

//      ------------------------------  LISTAR TICKETS  ------------------------------

router.get('/', (req, res) => {
    var lista = []

    const query = `SELECT t.IDTickets, t.fecha, t.visto,
                   e.nombre AS empresa,
                   s.nombre AS servicio,
                   p.nombre AS proyecto,
                   r.descripcion AS reporte,
                   c.descripcion AS consulta
                   FROM tickets AS t
                   JOIN empresas AS e
                   ON t.empresasID = e.IDEmpresas
                   LEFT JOIN servicios AS s
                   ON t.serviciosID = s.IDServicios
                   LEFT JOIN proyectos AS p
                   ON t.proyectosID = P.IDProyectos
                   LEFT JOIN reportes AS r
                   ON t.reportesID = r.IDReportes
                   LEFT JOIN consultas AS c
                   ON t.consultasID = c.IDConsultas;`

    database.query(query, (error, list, fields) => {
        
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
        
        } else {
            for (let i = 0; i < list.length; i++) {
                
                var ticket = {
                    "#ID": list[i].IDTicket,
                    fecha: list[i].fecha,
                    empresa: list[i].empresa
                }

                if (list[i].servicio) {
                    ticket.servicio = list[i].servicio

                } else if (list[i].proyecto) {
                    ticket.proyecto = list[i].proyecto

                } else if (list[i].reporte) {
                    ticket.reporte = list[i].reporte

                } else {
                    ticket.consulta = list[i].consulta
                }
                lista.push(ticket)
            }

            response.success(req, res, 200, `[DB] SELECTED`, '[LISTED]', lista)
        }
    })
})

//      -------------------------  LISTAR REPORTES DE FALLA  -------------------------

router.get('/reportes', (req, res) => {
    var lista = []

    const query = `SELECT t.IDTickets, t.fecha, t.visto,
                   e.nombre AS empresa,
                   r.descripcion AS reporte
                   FROM tickets AS t
                   JOIN empresas AS e
                   ON t.empresasID = e.IDEmpresas
                   JOIN reportes AS r
                   ON t.reportesID = r.IDReportes`

    database.query(query, (error, list, fields) => {
        
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
        
        } else {
            for (let i = 0; i < list.length; i++) {
                const ticket = {
                    TicketNro: list[i].IDTickets,
                    fecha: list[i].fecha,
                    empresa: list[i].empresa,
                    reporte: list[i].reporte
                }
      
                lista.push(ticket)
            }

            response.success(req, res, 200, `[DB] SELECTED`, '[LISTED]', lista)
        }
    })
})

//      ----------------------  LISTAR SOLICITUDES DE SERVICIO  ----------------------

router.get('/servicios', (req, res) => {
    var lista = []

    const query = `SELECT t.IDTickets, t.fecha, t.visto,
                   e.nombre AS empresa,
                   s.nombre AS servicio
                   FROM tickets AS t
                   JOIN empresas AS e
                   ON t.empresasID = e.IDEmpresas
                   JOIN servicios AS s
                   ON t.serviciosID = s.IDServicios`

    database.query(query, (error, list, fields) => {
        
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
        
        } else {
            for (let i = 0; i < list.length; i++) {
                const ticket = {
                    TicketNro: list[i].IDTickets,
                    fecha: list[i].fecha,
                    empresa: list[i].empresa,
                    servicio: list[i].servicio
                }
      
                lista.push(ticket)
            }

            response.success(req, res, 200, `[DB] SELECTED`, '[LISTED]', lista)
        }
    })
})

//      ---------------------  LISTAR LEVANTAMIENTO DE PROYECTOS  --------------------

router.get('/proyectos', (req, res) => {
    var lista = []

    const query = `SELECT t.IDTickets, t.fecha, t.visto,
                   e.nombre AS empresa,
                   p.nombre AS proyecto
                   FROM tickets AS t
                   JOIN empresas AS e
                   ON t.empresasID = e.IDEmpresas
                   JOIN proyectos AS p
                   ON t.proyectosID = p.IDProyectos`

    database.query(query, (error, list, fields) => {
        
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
        
        } else {
            for (let i = 0; i < list.length; i++) {
                const ticket = {
                    TicketNro: list[i].IDTickets,
                    fecha: list[i].fecha,
                    empresa: list[i].empresa,
                    proyecto: list[i].proyecto
                }
      
                lista.push(ticket)
            }

            response.success(req, res, 200, `[DB] SELECTED`, '[LISTED]', lista)
        }
    })
})

//      --------------------  LISTAR SOLICITUDES DE CONSULTORIA  ---------------------

router.get('/consultas', (req, res) => {
    var lista = []

    const query = `SELECT t.IDTickets, t.fecha, t.visto,
                   e.nombre AS empresa,
                   c.descripcion AS consulta
                   FROM tickets AS t
                   JOIN empresas AS e
                   ON t.empresasID = e.IDEmpresas
                   JOIN consultas AS c
                   ON t.consultasID = c.IDConsultas`

    database.query(query, (error, list, fields) => {
        
        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salio mal :(')
        
        } else {
            for (let i = 0; i < list.length; i++) {
                const ticket = {
                    TicketNro: list[i].IDTickets,
                    fecha: list[i].fecha,
                    empresa: list[i].empresa,
                    consulta: list[i].consulta
                }
      
                lista.push(ticket)
            }

            response.success(req, res, 200, `[DB] SELECTED`, '[LISTED]', lista)
        }
    })
})

//      ------------------------------  TRAER TICKETS   ------------------------------

router.get('/reportes/:id', (req, res) => {
    const id = req.params.id
    const query = `SELECT t.IDTickets, t.fecha, t.visto,
                   e.nombre AS empresa,
                   r.descripcion AS reporte
                   FROM tickets AS t
                   JOIN empresas AS e
                   ON t.empresasID = e.IDEmpresas
                   JOIN reportes AS r
                   ON t.reportesID = r.IDReportes`

    database.query(query, [id], (error, result, fields) => {

        if (error) {
            response.error(req, res, 500, `[DB] ERROR = ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo salió mal :(')
        
        } else if (!result[0]) {
            response.error(req, res, 404, `[BAD REQUEST]: ID = ${id}`, '[BAD REQUEST]', 'El ticket que intenta encontrar no existe...')

        } else {

            if (result[0].status) {
                var status = 'abierto'
            } else {
                var status = 'cerrado'
            }

            if (result[0].visto) {
                var visto = 'revisado'
            } else {
                var visto = 'sin revisar'
            }
            
            const ticket = {
                "Nro.": result[0].IDTicket,
                fecha: result[0].fecha,
                empresa: result[0].empresa,
                reporte: result[0].descripcion,
                status: result[0].status,
                visto: result[0].visto
            }

            response.success(req, res, 200, `[DB] SELECTED = ${ticket["Nro."]}`, '[SELECTED]', ticket)
        }
    })
})

//      ---------------------------  ACTUALIZAR PROYECTOS  ---------------------------

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

//      -----------------------------  ELIMINAR TICKETS  -----------------------------

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