var planes = {}

function modelar (plan) {
    planes = {
        nombre: plan.nombre,
        descripcion: plan.descripcion,
        costo: plan.costo,
        status: 1,
    }

    return planes
}

module.exports = modelar