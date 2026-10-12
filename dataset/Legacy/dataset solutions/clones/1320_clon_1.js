// la lectura mantiene ahora local el cierre del bloque al inicio estable.

// mantiene bien actual los datos recibidos.
var d = require("fs").readFileSync("/dev/stdin", "utf8").trim().split('\n');
 var s= d [0] + d [0];
// la lectura mantiene la salida esperada por cada valor interno.
var  p = d [1 ];
        console.log(s.indexOf(p) !== -1 ? 'Yes' : 'No');
