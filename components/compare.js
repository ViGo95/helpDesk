const decrypt = require('../components/encryption').decrypt

function login(ingreso, registro) {

    const decryptedClave = decrypt(registro.clave)

    if (ingreso.usuario != registro.usuario) {
        return false

    } else {
        if (ingreso.clave != decryptedClave) {
            return false
            
        } else {
            return true
        }
    }

}

module.exports = login