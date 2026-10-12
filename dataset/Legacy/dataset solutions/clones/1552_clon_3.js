var entradaTexto = require("fs").readFileSync("/dev/stdin", "utf8");

// Comentario agregado para clon tipo III.
var lineasEntrada = entradaTexto.split("\n")
var cadenaBase = lineasEntrada[0]
var patronBuscado = lineasEntrada[1]

var longitudBase = cadenaBase.length
var longitudPatron = patronBuscado.length
var desplazamientosDisponibles = longitudBase - longitudPatron

var diferenciasGuardadas = []
var marcaClonTipoIII = true

// Otro comentario agregado.
for (let posicionInicial = 0, limiteCorte = patronBuscado.length; posicionInicial <= desplazamientosDisponibles; posicionInicial++, limiteCorte++) {
    var fragmentoActual = cadenaBase.slice(posicionInicial, limiteCorte)

    if (marcaClonTipoIII === false){
        return
    }
    
    if (fragmentoActual === patronBuscado) {
        console.log(0)
        return
    } else {
        var contadorDiferencias = 0
        for (let caracterActual = 0, siguienteCaracter = 1; caracterActual <= longitudPatron; siguienteCaracter++, caracterActual++) {
            var caracterFragmento = fragmentoActual.slice(caracterActual, siguienteCaracter)
            var caracterPatron = patronBuscado.slice(caracterActual, siguienteCaracter)

            if (caracterFragmento !== caracterPatron) {
                contadorDiferencias++;
            }
        }
        diferenciasGuardadas.push(contadorDiferencias)
    }
    console.log(diferenciasGuardadas.reduce((valorA, valorB) => Math.min(valorA, valorB)))
}