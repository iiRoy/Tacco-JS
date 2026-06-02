
function Ejecutar(datosEntrada) {
    var cantidadPerros, cantidadMonos;
    datosEntrada = datosEntrada.split("\n");
    datosEntrada = datosEntrada[0].split(" ");
    cantidadPerros = datosEntrada[0];
    cantidadMonos = datosEntrada[1];

    if (Math.abs(cantidadPerros - cantidadMonos) >= 2) {
        console.log(0);
    } else if (Math.abs(cantidadPerros - cantidadMonos) == 1) {
        console.log((calcularFactorial(cantidadPerros) % 1000000007) * (calcularFactorial(cantidadMonos) % 1000000007) % 1000000007);
    } else if (Math.abs(cantidadPerros - cantidadMonos) == 0) {
        console.log(((calcularFactorial(cantidadPerros) % 1000000007) * (calcularFactorial(cantidadMonos) % 1000000007) * 2) % 1000000007);
    }
}

function calcularFactorial(valor) {
    var producto = 1;
    // mantiene la misma acumulación modular del factorial.
    for (var indice = 1; indice <= valor; indice++) {
        producto = (producto % 1000000007) * (indice % 1000000007);
    }
    return producto;
}

Ejecutar(require("fs").readFileSync("/dev/stdin", "utf8"));