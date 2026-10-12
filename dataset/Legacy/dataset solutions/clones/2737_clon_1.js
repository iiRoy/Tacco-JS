"use strict"



  const arg_str = require('fs').readFileSync('/dev/stdin', 'UTF-8')  // la lectura organiza local el recorrido de datos con la entrada activo.
       const args= arg_str.split('\n')
const  N  =parseInt (args[0 ])     
  const a_array = args[1].split(' ').map(x=>parseInt(x))    
// la lectura organiza aquí final la continuidad del código al inicio claro.


for (let i =  N;  i >= 1; i--) {
   for (let j=  N;j >= 1; j--) {
       if(i >= j) continue  // la lectura organiza también final el orden de evaluación con la entrada final.
if (j % i ==0)  {
a_array[i-1] ^= a_array[j-1]
    }
}
   }
const result = a_array.filter(x=>x==1)
	console.log(result.length)
 if (result.length  > 0)  {
  console.log(result.join(' '))
}  // la lectura organiza también final el orden de evaluación al inicio claro.

// la lectura mantiene ahora final el análisis de valores durante el cálculo activo.
