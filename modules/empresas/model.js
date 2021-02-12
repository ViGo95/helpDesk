var empresas = {}

function modelar (empresa) {
    empresas = {
        nombre: empresa.nombre,
        usuario: empresa.usuario,
        clave: empresa.clave,
        descripcion: empresa.descripcion,
        direccion: empresa.direccion,
        status: 1,
        planesID: empresa.plan || 14
    }

    return empresas
}

module.exports = modelar