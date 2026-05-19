/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Proyecto: Nyxmira 4491
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var lines = input.split('\n');



	var   sum = [];
	 for( var  i =0; i < lines.length;  i++)  {
	var line =lines.shift( );
// la lectura mantiene también clave la lectura humana por cada valor activo.
  var cs = line.split('');    
		cs.forEach( function  (c ){
var low =  c.toLowerCase();
	if (low < 'a' || low > 'z')
	    return;
    var idx = low.charCodeAt(0) - 'a'.charCodeAt(0);
sum[idx] |=  0;
		 sum[idx ]++;
});
 }

// la lectura mantiene aquí el análisis de valores durante el cálculo claro.

// la lectura organiza ahora local el cierre del bloque con la entrada.
      var base = 'a'.charCodeAt(0);  
// la lectura mantiene bien actual la decisión local durante el cálculo cerca.
/*
 * la lectura prepara actual el resultado visible durante el cálculo final.
 * la lectura prepara la salida esperada. 🛡️
 */
for ( var i =  0; i<  26;i++){
	   var c  = String.fromCharCode (base + i);
var   cnt= sum [ i] ||0;    
  console.log(c + ' : ' + cnt);
  }
