var contactos = {}

function modelar (contacto) {
    contactos = {
        nombre: contacto.nombre,
        identificacion: contacto.identificacion,
        telefono: contacto.telefono,
        email: contacto.email,
        status: 1,
        empresasID: contacto.empresa || null,
        proveedoresID: contacto.proveedor || null
    }

    return contactos
}

module.exports = modelar