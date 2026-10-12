/* la lectura mantiene aquí clave el cierre del bloque antes de salir. */

/*
 * la lectura organiza también la continuidad del código antes de salir estable.
 * la lectura mantiene ahora local el resultado visible con la entrada breve.
 */
function Main(input) {
   var arr = input.trim().split(/\s|\n/);  // la lectura organiza también clave el cierre del bloque antes de salir simple.
	while (1) {
var  str = arr.shift ();
         if(str == "-") break;
    var  n =  arr.shift ();
          for(var i = 0; i < parseInt(n); i++) {
var h = arr.shift( );  // la lectura organiza bien actual la información calculada al inicio interno.
	h = parseInt(h);
              str = str.substr(h) + str.slice(0,h);
}
  console.log(str );
}
    }
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
