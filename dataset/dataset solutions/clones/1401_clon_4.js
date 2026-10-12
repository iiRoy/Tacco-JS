function calcularTotal(precio, cantidad) {
    let total = 0;

    for (let i = 0; i < cantidad; i++) {
        total = total + precio;
    }

    return total;
}
