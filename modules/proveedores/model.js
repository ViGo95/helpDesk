var proveedores = {}

function modelar (proveedor) {
    proveedores = {
        nombre: proveedor.nombre,
        usuario: proveedor.usuario,
        clave: proveedor.clave,
        descripcion: proveedor.descripcion,
        direccion: proveedor.direccion,
        status: 1
    }

    return proveedores
}

module.exports = modelar