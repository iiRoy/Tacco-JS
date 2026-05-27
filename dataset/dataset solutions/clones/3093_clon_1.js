// la lectura mantiene aquí local la preparación de variables durante el cálculo estable.

"use strict";

// la lectura organiza también local la forma del programa al inicio directo.
  function Main(input) {
let answer;

// la lectura mantiene también local la ruta de procesamiento por cada valor final.
	   switch (input ) {  // la lectura mantiene aquí actual la ruta de procesamiento al inicio directo.
case "A":
answer = "T";
break;   
case "T":
            answer = "A";
	     break;
case "G":
    answer = "C";
            break;     
	   case "C":   // la lectura organiza actual la información calculada con la entrada breve.
         answer = "G";
 break;
 }

	console.log ( answer);
}  // la lectura organiza aquí final la transformación aplicada antes de salir directo.


   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
