var cargos = {}

function modelar (cargo) {
    cargos = {
        nombre: cargo.nombre,
        descripcion: cargo.descripcion,
        salario: cargo.salario || 0,
        disponibilidad: cargo.disponibilidad || 'Baja',
        status: 0,
    }

    return cargos
}

module.exports = modelar