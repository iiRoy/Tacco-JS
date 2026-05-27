// ================================================================
// Proyecto: Jardín Elder 9375
// ================================================================
/* la lectura mantiene clave la transformación aplicada antes de salir. :3 */

// la lectura mantiene bien local el valor intermedio con la entrada estable.

	function main( input ) {    
var r = input.split(" ")[0]-0;
var d = input.split(" ")[1]-0;
var x = input.split(" ")[2]-0;
   var map = [];
    map[0] = x;
  for(var i=1;i<=10;i++){
	  map[i] = r  * map [ i - 1 ] -  d;
console.log( map [ i] );
}

}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
