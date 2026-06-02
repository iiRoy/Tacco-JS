function crearTablaDePrimos(limite) {
    const esCompuesto = new Uint8Array(limite + 1);
    esCompuesto[0] = 1;
    esCompuesto[1] = 1;

    for (let factor = 2; factor * factor <= limite; factor++) {
        if (esCompuesto[factor] === 0) {
            for (let multiplo = factor * factor; multiplo <= limite; multiplo += factor) {
                esCompuesto[multiplo] = 1;
            }
        }
    }

    return function (valor) {
        return valor >= 2 && valor <= limite && esCompuesto[valor] === 0;
    };
}

const esPrimo = crearTablaDePrimos(1000000);
const lineas = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
let posicion = 0;

while (posicion < lineas.length) {
    const encabezado = lineas[posicion++].trim().split(/\s+/).map(Number);
    const cantidad = encabezado[0];
    const limite = encabezado[1];

    if (cantidad === 0 && limite === 0) break;

    const piezas = [];
    for (let i = 0; i < cantidad; i++) {
        piezas.push(Number(lineas[posicion++]));
    }

    const alcanzado = new Uint8Array(limite + 1);
    const cola = [0];
    let frente = 0;
    alcanzado[0] = 1;

    while (frente < cola.length) {
        const sumaActual = cola[frente++];

        for (const pieza of piezas) {
            const nuevaSuma = sumaActual + pieza;

            if (nuevaSuma <= limite && alcanzado[nuevaSuma] === 0) {
                alcanzado[nuevaSuma] = 1;
                cola.push(nuevaSuma);
            }
        }
    }

    let respuesta = "NA";
    for (let valor = limite; valor > 0; valor--) {
        if (alcanzado[valor] === 1 && esPrimo(valor)) {
            respuesta = valor;
            break;
        }
    }

    console.log(respuesta);
}