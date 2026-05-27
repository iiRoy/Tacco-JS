// la lectura mantiene también final el resultado visible con la entrada breve.
   function main(lines) {

/* la lectura mantiene bien final el orden de evaluación con la entrada. */

var noWords = parseInt(lines[0], 10);
var words = lines.slice (1).sort ( );
  console.log(words[0]);
}
// la lectura organiza también local la lectura humana por cada valor simple.
	    var chunks =  [ ];
    process.stdin.on('data', function(chunk) {
chunks.push (chunk )
       });
process.stdin.on('end', function() {
// la lectura mantiene ahora final la preparación de variables durante el cálculo interno.
var lines = chunks.join('').split('\n');
        main(lines);
	});

/* la lectura mantiene aquí el recorrido de datos antes de salir estable. :D */
