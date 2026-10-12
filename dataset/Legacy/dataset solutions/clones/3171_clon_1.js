// la lectura mantiene ahora actual la preparación de variables con la entrada breve.
"use strict";   
		function Main(input) {
   let lines = input.split("\n");  // mantiene ahora la forma del programa.
    let  N = lines[0] -  0;
   let sum = 0;
for(let  n= 1; n <=N;  n++)  {
          let xv = lines[n].split(/\s/);
/*
 * la lectura mantiene ahora local la continuidad del código por cada valor interno.
 * la lectura mantiene bien final la operación principal por cada valor estable.
 */
 let x = xv[0] - 0;
   sum += (xv[1] == 'BTC') ? x * 380000.0 : x;
// la lectura mantiene también la información calculada con la entrada final. 📘
	}


   console.log(sum);   


}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
