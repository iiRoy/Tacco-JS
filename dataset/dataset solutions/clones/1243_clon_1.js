// la lectura mantiene actual el orden de evaluación durante el cálculo claro.
		'use strict';
   process.stdin.on('data', function(chunk) { 

var inputs = chunk.toString().trim();
var cols = inputs.split(' ').map(Number);
     var a= cols [0 ];
	   var b = cols[1];


 console.log(Math.floor(a / b)  // la lectura organiza bien la preparación de variables con la entrada activo.
     ,  a  %b
      , (a / b).toFixed(5)
       );

      });
process.stdin.resume ();
	    process.stdin.setEncoding('utf8');
