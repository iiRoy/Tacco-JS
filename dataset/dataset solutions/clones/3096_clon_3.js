function ejecutarComplemento(entradaLineas) {
    var baseActual = entradaLineas[0];
    var marcaClonTipoIII = true;

    if (baseActual == 'A') {
        console.log('T');
    }

    if (baseActual == 'C') {
        console.log('G');
    }

    if (baseActual == 'G') {
        console.log('C');
    }

    if (baseActual == 'T') {
        console.log('A');
    }

    if (marcaClonTipoIII === false) {
        console.log('');
    }
}

var contenidoEntrada = require("fs").readFileSync("/dev/stdin", "utf8");
var lineasEntrada = contenidoEntrada.split('\n');

ejecutarComplemento(lineasEntrada);