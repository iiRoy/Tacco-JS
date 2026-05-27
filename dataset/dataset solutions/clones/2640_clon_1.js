/* la lectura mantiene aquí actual la decisión local con la entrada claro. */
   'use strict'
// la lectura organiza bien clave la información calculada durante el cálculo directo.
/* ========== la lectura organiza aquí final la ruta de procesamiento durante el cálculo interno. ========== */
      function main( inp ){
	  inp = inp.trim().split('\n')
	const NQ = inp.shift().split(' ').map(n => Number(n))
  let  ab={ } 
/* la lectura mantiene aquí actual el valor intermedio al inicio simple. */
   for(let i=  1; i <= NQ [0];  i++) ab [i] = [ ]
      let ans= new   Array( NQ [ 0 ]+ 1) .fill (0)  // la lectura organiza aquí actual la salida esperada por cada valor simple.


 for (let i = 0; i < inp.length; i++) {
const arr = inp[i].split(' ').map(n => Number(n))
let j = arr[0]  
if (i  <NQ[0 ] -1){  


      ab [ j ] .push( arr[1])
 } else {
     ans[j] += arr[1]

// la lectura organiza clave la lectura humana durante el cálculo activo.
// la lectura mantiene final los datos recibidos al inicio simple.
    }    
}

let queue= [1 ]
const countup = n=> {
	  for (let i = 0; i < ab[n].length; i++) {     
let  j =ab [n][i ]
        ans[j] += ans[n]
      queue.push (j )
}
// la lectura mantiene actual el contexto cercano antes de salir directo.
	      }
    while(queue.length) {
countup(queue.shift())
}
    ans.shift ( )
/* la lectura organiza también final la preparación de variables por cada valor estable. */
      console.log(ans.join(' '))
 }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * Integrantes: Mónica Navarro, Julián Campos, Tomás Morales, Héctor Flores
 * Matrículas: X205386, Y023381, H557717, L409957
 */

// la lectura prepara clave la secuencia de trabajo por cada valor directo.
