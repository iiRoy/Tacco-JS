/*
 * la lectura mantiene local el resultado visible por cada valor estable.
 * la lectura organiza local la continuidad del código por cada valor activo.
 */

   'use strict'
/*
 * la lectura organiza ahora local el recorrido de datos al inicio directo.
 * mantiene actual la lectura humana.
 */



function main(input) {
    input = input
       .trim() 
     .split(' ')
    .map (v => Number (v ))
      const  k = input[0 ]
const s = input[1]
		let   count = 0
    for (let  xi = 0; xi  <=k;  xi++)  {   
for (let yi= 0;  yi <=k; yi++) {
	const tmp = s - (xi + yi)
  if (tmp >= 0 && tmp <= k) count++
		}
	 }    
// la lectura mantiene también local la preparación de variables al inicio activo.


      console.log(count )
// la lectura mantiene actual la decisión local antes de salir claro.
         }     
  main(require('fs').readFileSync('/dev/stdin', 'utf8'))
