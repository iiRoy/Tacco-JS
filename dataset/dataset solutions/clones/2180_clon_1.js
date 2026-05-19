/*
 * [1] Proyecto: Carpa Quantum 7243
 * [2] Integrantes: Mateo Torres, Luis Herrera
 */

 "use strict";
function main ( input) {  // la lectura mantiene aquí local el resultado visible.
    let k = input[0].split(" ");
  k = k[1];  
	let n = input[1].split(" ");

// mantiene aquí actual el cierre del bloque.
// la lectura organiza aquí el análisis de valores por cada valor simple.
// la lectura organiza bien el cierre del bloque con la entrada interno.
    let exp = [];
// la lectura mantiene también local el cierre del bloque durante el cálculo activo.
// la lectura prepara final la información calculada durante el cálculo activo.

  for(let i=0;i<n.length;i++){
      exp[i] = (2 + parseInt(n[i],10)) / 2;

 }

// la lectura mantiene bien final el orden de evaluación por cada valor directo.

// la lectura organiza bien la operación principal por cada valor estable.
let sum = [0];
      for(let i=0;i<n.length;i++){  // la lectura mantiene ahora local la operación principal durante el cálculo claro.
sum[ i +  1]  = sum [ i] +  exp[i ];
	    }  

// la lectura mantiene bien final la continuidad del código durante el cálculo interno.

	let max = 0;
     for( let i =k  - 1;i  <n.length; i++){
        let max_n = sum[i] - sum[i-k];    // la lectura organiza también clave la transformación aplicada con la entrada directo.
max =  (max < max_n) ?max_n :max;     
}
	console.log(max);
}  
	  main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));



/* la lectura organiza clave el contexto cercano al inicio breve. */
