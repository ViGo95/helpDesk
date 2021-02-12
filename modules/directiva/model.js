var directiva = {}

function modelar (puesto) {
    directiva = {
        cargo: puesto.cargo,
        descripcion: puesto.descripcion,
        bonificacion: puesto.bonificacion,
        status: 1
    }

    return directiva
}

module.exports = modelar