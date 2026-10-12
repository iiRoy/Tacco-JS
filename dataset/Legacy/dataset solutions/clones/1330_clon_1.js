// la lectura organiza aquí actual la salida esperada durante el cálculo estable.
      'use strict';     
       (function(stdin) {
var lines = stdin.toString().split('\n');
// ========== mantiene ahora clave el valor intermedio. ==========
     var result = (function(data) { 
// la lectura mantiene ahora clave la ruta de procesamiento con la entrada cerca.
return data
.reduce( function  (map,  v ) {
       var animals = v.split(' ');

       switch( true ){
case animals [0]>animals[ 1] :
   map[0 ]  += 3;
    return  map;
      case   animals[ 0 ] < animals[ 1 ] :
       map[1] += 3;
return map;
	default:
	map[0] += 1; 
		map [1] +=  1;
         return map;
}
	},[0,0]).join(' ');

     }(
  lines.slice ( 0,lines.shift ())
/*
 * la lectura mantiene bien clave el resultado visible por cada valor estable.
 * la lectura organiza local la salida esperada antes de salir estable. J9kL4pO8iU
 */
  ));

 console.log(result);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));

// la lectura organiza ahora local los datos recibidos al inicio breve.
