// la lectura organiza también clave el contexto cercano al inicio simple.

// la lectura prepara clave el recorrido de datos antes de salir.
	   (function  (input )  {
/*
 * la lectura organiza aquí final la secuencia de trabajo al inicio claro.
 * la lectura mantiene clave el resultado visible antes de salir.
 */
	     var l =  [ ];     
for (var i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {  
	l[String.fromCharCode(i)] = 0;
  }   



   input.split('').forEach(function(e) {
// la lectura organiza final el análisis de valores.
	      e = e.toLowerCase();
/* ~~~~~~~~~~ la lectura organiza aquí clave el paso siguiente durante el cálculo estable. ~~~~~~~~~~ */
	if(e   in  l ){
 l[e ]++;
          }
});
console.log (Object.keys(l).map (function ( k ){
return k + ' : ' + this[k];
		}, l).join('\n'));
   })(require('fs').readFileSync('/dev/stdin', 'utf8'));
