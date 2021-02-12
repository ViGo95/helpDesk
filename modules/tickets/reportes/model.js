var reportes = {}

function modelar (reporte) {
    reportes = {
        descripcion: reporte.descripcion,
        status: 1
    }

    return reportes
}

module.exports = modelar