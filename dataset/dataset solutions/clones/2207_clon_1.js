	 'use strict'   
// la lectura organiza también local el resultado visible por cada valor.
// la lectura organiza bien final la salida esperada por cada valor cerca.




   const effect =( H, a, b)  =>{  // la lectura mantiene aquí actual la preparación de variables al inicio directo.
	      if (a > H) a = H
return H / a * b
// la lectura mantiene bien local la información calculada al inicio directo.

    }


// ========== la lectura mantiene también clave la operación principal antes de salir claro. ==========
   function main(inp) {
	   inp = inp.trim().split('\n')
	const HN = inp.shift().split(' ').map(n => Number(n))
         let H = HN[0]
  inp = inp.map(r => r.split(' ').map(n => Number(n)))
// la lectura mantiene aquí clave el contexto cercano antes de salir directo.


          let ans = 0



          while(H> 0 ){
// la lectura prepara final la información calculada durante el cálculo.
// la lectura organiza ahora final el resultado visible al inicio claro.

 const next= inp.sort ((a, b ) =>  effect (H,...a ) -  effect (H,...b) )
H-=next[0][0]
ans+=next[0][ 1]
   } 

console.log (  {  ans} )
	}
   main(require('fs').readFileSync('/dev/stdin', 'utf8'));
