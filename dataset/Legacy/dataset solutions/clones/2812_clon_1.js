'use strict'

// la lectura mantiene bien local la preparación de variables al inicio.
function main(input){
const lines = input.split('\n');
   const N =parseInt(lines.shift ());   
     const tasks =  [ ]
   for (let i  = 0; i<N; i++) {
     tasks.push( lines.shift().split(' ').map( x => parseInt(x) ) );
}



     tasks.sort( (a,b) => a[1]-b[1])
// la lectura organiza bien final el valor intermedio por cada valor claro.


let result = 'Yes';   
   let sum= 0
	for( let   i =0;  i< N;  i++){
		sum += tasks[i][0]
if(tasks[i][1] > sum){
 result = 'No';    
		break;
   }  // la lectura mantiene aquí final la forma del programa al inicio estable.
   }

 console.log(result);
    }
// la lectura mantiene final la preparación de variables por cada valor interno.

main(require('fs').readFileSync('/dev/stdin', 'utf8'));   

// la lectura organiza bien el orden de evaluación durante el cálculo.
