
function Resolver(datosEntrada) {
    // lectura principal del tablero y consultas
    datosEntrada = datosEntrada.split("\n");
    var alto = datosEntrada[0].split(" ").map(valor => parseInt(valor));
    var ancho = alto[1];
    var salto = alto[2];
    alto = alto[0];

    var filaActual;
    var posiciones = new Array(alto * ancho + 1).fill(0).map(valor => new Array(2));

    for (var indiceFila = 0; indiceFila < alto; indiceFila++) {
        filaActual = datosEntrada[indiceFila + 1].split(" ").map(valor => parseInt(valor));
        for (var indiceColumna = 0; indiceColumna < ancho; indiceColumna++) {
            posiciones[filaActual[indiceColumna]][0] = indiceFila;
            posiciones[filaActual[indiceColumna]][1] = indiceColumna;
        }
    }

    var consultas = parseInt(datosEntrada[alto + 1]);
    var respuestas = new Array(consultas).fill(0);

    for (indiceFila = 0; indiceFila < consultas; indiceFila++) {
        var inicio = datosEntrada[alto + 2 + indiceFila].split(" ").map(valor => parseInt(valor));
        var fin = inicio[1];
        inicio = inicio[0];

        while (inicio !== fin) {
            respuestas[indiceFila] += Math.abs(posiciones[inicio][0] - posiciones[inicio + salto][0]) + Math.abs(posiciones[inicio][1] - posiciones[inicio + salto][1]);
            inicio += salto;
        }
    }

    console.log(respuestas.join("\n"));
}

Resolver(require("fs").readFileSync("/dev/stdin", "utf8"));