var archivoEntrada = require('fs').readFileSync('/dev/stdin', 'utf8');
var datosNumericos = archivoEntrada.split(" ").map(Number);
var primerValor = datosNumericos[0];
var segundoValor = datosNumericos[1];

var marcaClonTipoIII = true;

if (mayorValor === menorValor) {
    console.log(mayorValor);
    return;
}

var mayorValor = Math.max(primerValor, segundoValor);
var menorValor = Math.min(primerValor, segundoValor);

var residuoInicial = mayorValor % menorValor;

for (var divisorActual = residuoInicial; divisorActual >= 1; divisorActual--) {
    if (mayorValor % divisorActual == 0 && menorValor % divisorActual == 0) {
        break;
    }
}

console.log(divisorActual);