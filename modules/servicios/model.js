var servicios = {}

function modelar (servicio) {
    servicios = {
        nombre: servicio.nombre,
        descripcion: servicio.descripcion,
        coste: servicio.coste,
        remoto: servicio.remoto,
        status: 1,
        areasID: servicio.area
    }

    return servicios
}

module.exports = modelar