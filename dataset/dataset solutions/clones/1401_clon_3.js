function calcularTotalConDescuento(precio, cantidad) {
    let total = precio * cantidad;

    if (cantidad >= 10) {
        total = total - 20;
    }

    return total;
}
