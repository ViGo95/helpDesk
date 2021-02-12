var tickets = {}

function modelar(ticket) {
    tickets = {
        fecha: new Date(),
        visto: 0,
        status: 1,
        empresasID: ticket.empresa,
        personalID: null,
        serviciosID: ticket.servicio || null,
        proyectosID: ticket.proyecto || null,
        reportesID: ticket.reporte || null,
        consultasID: ticket.consulta || null
    }

    return tickets
}

module.exports = modelar