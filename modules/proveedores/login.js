const express = require('express')
const router = express.Router()
const response = require('../../network/response')
const database = require('../../db')
const compare = require('../../components/compare')

router.get('/', (req, res) => {
    const proveedor = {
        nombre: req.body.nombre,
        usuario: req.body.usuario,
        clave: req.body.clave
    }

    const query = 'SELECT * FROM proveedores WHERE nombre = ?'
    
    if (!proveedor.nombre || !proveedor.usuario || !proveedor.clave) {
        response.error(req, res, 400, '[DB] INCOMPLETED DATA', '[INCOMPLETED DATA]', 'Datos incompletos...')
    
    } else {
        
        database.query(query, [proveedor.nombre], (error, result, fields) => {
            if (error) {
                response.error(req, res, 500, `[DB] ${error}`, '[UNESPECTED ERROR]', 'Oops... Algo ha salido mal')
           
            } else if (!result[0]) {
                response.error(req, res, 404, `[DB] NOT REGISTERED`, '[NOT REGISTERED]', 'El proveedor no ha sido registrado aún...')
            
            } else {
                const access = compare(proveedor, result[0])

                if (access) {
                    response.success(req, res, 200, '[SERVER] ACCESS GRANTED', '[SUCCESS] ', 'Acceso permitido!')
                
                } else {
                    response.error(req, res, 401, '[SERVER] ACCESS DENIED', '[DENIED]', 'Datos incorrectos...')
                }
            }
        })
    }
})

module.exports = router