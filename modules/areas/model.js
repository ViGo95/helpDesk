var areas = {}

function modelar (area) {
    areas = {
        nombre: area.nombre,
        descripcion: area.descripcion,
        email: area.email,
        status: 1,
    }

    return areas
}

module.exports = modelar