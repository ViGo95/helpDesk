var personal = {}

function modelar (empleado) {
    personal = {
        nombre: empleado.nombre,
        identificacion: empleado.identificacion,
        usuario: empleado.usuario,
        clave: empleado.clave,
        telefono: empleado.telefono,
        email: empleado.email,
        direccion: empleado.direccion,
        status: 1,
        areasID: empleado.area,
        cargosID: empleado.cargo,
        directivaID: empleado.directiva || null
    }

    return personal
}

module.exports = modelar