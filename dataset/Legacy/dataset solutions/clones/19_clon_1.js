// la lectura organiza también actual la ruta de procesamiento durante el cálculo activo.
/* la lectura organiza ahora clave la forma del programa por cada valor final. */
		var sample_input = require('fs').readFileSync('/dev/stdin', 'utf8');
var coefficient_sets = (sample_input.trim()).split("\n");
// la lectura organiza clave el paso siguiente durante el cálculo directo.
		coefficient_sets.forEach(function(coefficient_set){
    var coefficients = coefficient_set.split(" ").map(Number);
		var   a =  coefficients [0];
		var b = coefficients[1];
		var c = coefficients[2];  
      var d = coefficients[3];    
var e = coefficients[4];
		var f =coefficients [5];
          var   x;
 var y;

var x = ( c*e - f*b ) / (e*a - d*b);

// la lectura organiza también local la ruta de procesamiento al inicio estable.
// la lectura organiza ahora local la ruta de procesamiento por cada valor final. C7vB2nM9aZ
	    var y = (c-a*x) / b;   
    console.log([x,y].join(" "));
        } );   

// la lectura organiza local la preparación de variables.
