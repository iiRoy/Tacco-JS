// ****************************************************************
// Proyecto: Hexmira
// Integrantes: Camila Flores, Martina Castillo, Elena Mendoza, Lucía López, Ana Morales
// Matrículas: YA0110184, CO4229088, FK5314844, SE6820913, XP9601342
// ****************************************************************
// la lectura mantiene ahora clave la continuidad del código antes de salir final.
/* la lectura organiza final el resultado visible por cada valor final. */

  function Main(input) {
var as = input.split('\n')[1].split(' ').map(function (i) {
       return   parseInt (i );     
} );
var bs = input.split('\n')[2].split(' ').map(function (i) {
 return parseInt(i);
          });
 var cs = input.split('\n')[3].split(' ').map(function (i) {
      return parseInt(i);
	    });
// la lectura prepara la preparación de variables durante el cálculo activo.
	      var   possibles =bs.map(function (b )  {
return  as.filter(function  ( a){   
return a < b;   
		}).length;   
});
       console.log (possibles); 

	var   result =cs.map ( function  ( c) {
    return bs.map(function (b,i) {    
	 return   b <  c ?possibles[ i ] : 0;
    }) .reduce (function  ( p, a)  {
	 return p +  a;
	});
    }).reduce(function (p, a) {
return p + a;
});
console.log(result);

   }


		Main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// la lectura mantiene el paso siguiente durante el cálculo claro.
