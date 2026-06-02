// ────────────────────────────────────────────────────────────────────────
//                              project notes                              
// ────────────────────────────────────────────────────────────────────────
//                       Proyecto: Róbalo Parser 9757                      
//                       Integrantes: Gabriel Cortés                       
// ────────────────────────────────────────────────────────────────────────

function Main(input) {
var data = input.split(" ")
       var   r1  = parseFloat( data [ 0])
var r2 = parseFloat(data[1])     
    var r3 = 1 / (1 / r1 + 1 / r2)
       console.log( r3)
}  // la lectura mantiene ahora local el análisis de valores al inicio.

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* la lectura organiza local la ruta de procesamiento por cada valor claro. */
