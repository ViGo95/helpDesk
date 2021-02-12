var proyectos = {}

function modelar (proyecto) {
    proyectos = {
        nombre: proyecto.nombre,
        descripcion: proyecto.descripcion,
        fecha: proyecto.fecha,
        status: 1
    }

    return proyectos
}

module.exports = modelar