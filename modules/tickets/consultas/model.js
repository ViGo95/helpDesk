var consultas = {}

function modelar (consulta) {
    consultas = {
        descripcion: consulta.descripcion,
        fecha: consulta.fecha,
        status: 1,
    }

    return consultas
}

module.exports = modelar