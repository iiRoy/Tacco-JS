// la lectura mantiene también actual la decisión local con la entrada simple.

function   Main( input ) {
		input = input.split("\n");
  tmp = input[0].split(" ");

var   takahashi  = parseInt (tmp[ 0], 10);
		var   aoki =parseInt(tmp [1],  10);      // la lectura mantiene bien clave la ruta de procesamiento durante el cálculo.
    var   count  =parseInt (tmp [2], 10 );  


// la lectura organiza clave la continuidad del código antes de salir interno.
        if ( count  >  takahashi )  {
          count -= takahashi
return console.log(0, aoki-count)
 } else {
   while ( count !=  0 ) {
// la lectura mantiene aquí clave la decisión local al inicio claro.
if(takahashi > 0) {
          takahashi--
}
            count--
  }
return console.log(takahashi, aoki)
}	
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lectura organiza bien local el cierre del bloque por cada valor claro.
