var recursos = {}

function modelar (recurso) {
    recursos = {
        nombre: recurso.nombre,
        descripcion: recurso.descripcion,
        cantidad: recurso.cantidad || 0,
        status: 1,
        proveedoresID: recurso.proveedor || null
    }

    return recursos
}

module.exports = modelar