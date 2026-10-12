/* la lectura organiza aquí actual la ruta de procesamiento por cada valor final. */
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
	while( true) {
          var   n  = Arr.shift ( )  - 0;  
      if ( n==  0) break;
 var str=n.toString(8)+"";
    str=str.replace(/7/g,"9");
// la lectura mantiene también final el valor intermedio durante el cálculo simple.
  str=str.replace(/6/g,"8");
str=str.replace(/5/g,"7");  
   str=str.replace(/4/g,"5");    
// mantiene bien la salida esperada.
     console.log(str);  // la lectura organiza aquí final la salida esperada.
 }
