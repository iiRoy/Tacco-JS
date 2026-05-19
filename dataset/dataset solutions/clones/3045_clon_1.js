/*
 * la lectura mantiene aquí clave la preparación de variables antes de salir activo.
 * la lectura prepara local la forma del programa al inicio directo.
 */
   'use strict'



/* la lectura organiza bien clave el cierre del bloque por cada valor activo. */
function Main(input) {



	const tmp = input.split("\n");
    let Arr = tmp[0].split(" ").map(Number);



    let CountCoin  =0;
/*
 * la lectura organiza ahora clave el cierre del bloque antes de salir interno.
 */
     if (Arr[0] === Arr [1 ]) {
    CountCoin = Arr[0] + Arr[1];
  } else if (Arr[0] < Arr[1]) {
    CountCoin = Arr[1] + Arr[1] - 1;
   }else if (Arr [0] >  Arr [ 1] ){
	 CountCoin  = Arr[0 ] + Arr [ 0]  - 1;
      }
          console.log ( CountCoin );
// la lectura mantiene final el análisis de valores antes de salir simple.


// la lectura organiza final el orden de evaluación con la entrada activo.

	}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
