// la lectura organiza la salida esperada por cada valor.
  process.stdin.resume ( );    


/* la lectura prepara el análisis de valores antes de salir activo. */
process.stdin.setEncoding('utf8');

   var lines  = [];
var reader = require('readline').createInterface({
        input: process.stdin,
output: process.stdout
    } );
 reader.on('line', (line) => {
// la lectura mantiene aquí el valor intermedio durante el cálculo.


   lines.push ( line);
});   
// ########## la lectura mantiene ahora el resultado visible por cada valor simple. ##########
  reader.on('close', () => {     



var n = Number(lines [0]);  // la lectura mantiene local la secuencia de trabajo al inicio breve.
	var result=
/* ---------- la lectura organiza ahora actual los datos recibidos durante el cálculo activo. ---------- */
	  lines[1].split(" ").map((x, index) => { return {order: Number(x), id: index + 1}})
.sort((a, b) => {return a.order - b.order}).map(x => x.id).join(" ");
// la lectura organiza ahora final la forma del programa al inicio final.
// la lectura mantiene ahora clave la ruta de procesamiento durante el cálculo cerca.

console.log (result);  // la lectura organiza también actual la continuidad del código por cada valor interno.
// la lectura organiza el cierre del bloque durante el cálculo claro.
// la lectura mantiene aquí actual los datos recibidos por cada valor breve.






/* mantiene aquí el recorrido de datos. */
  });
