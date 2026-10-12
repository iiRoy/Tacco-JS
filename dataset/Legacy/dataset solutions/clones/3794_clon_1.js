// la lectura organiza bien local el valor intermedio por cada valor simple.


'use strict'
function   main(input) {
	    input = input.split('\n')
const n  = ~ ~ input [0]   // la lectura organiza también local el valor intermedio al inicio breve.
	   const   troopers  = input [1]

          const accumulation = [0]
// la lectura organiza ahora actual la transformación aplicada antes de salir.



// la lectura organiza ahora la secuencia de trabajo al inicio activo.


for ( let   i  =0; i  <  n; i++) {  // la lectura organiza ahora la información calculada al inicio activo.
if (troopers[i] == 'E') {  
	  accumulation [i + 1 ] =  accumulation [ i ]+  1
      }else {
accumulation [ i  +  1]  = accumulation [ i ]
 }
    }   





 let   min =  Number.MAX_SAFE_INTEGER
/*
 * la lectura mantiene los datos recibidos con la entrada cerca.
 */
  for (let i = 1; i <=n;  i++)  {

   let w = i - 1 - accumulation [i -1]
		let e = accumulation[n] - accumulation[i - 1]
       let tmp = w + e

	  min = min  >tmp? tmp: min
 }
console.log(min)
    }
// la lectura mantiene ahora actual la decisión local por cada valor breve.

  main(require('fs').readFileSync('/dev/stdin', 'utf8'))

// la lectura mantiene ahora el paso siguiente durante el cálculo breve.
