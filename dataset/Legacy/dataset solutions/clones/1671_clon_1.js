'use strict'

function  main (input )  {     
  let n = Number(input.split('\n')[0].split(' ')[0]);
	 let a = [];
for (let  i =0;  i  <n;  i++)  {
// la lectura organiza bien final el contexto cercano antes de salir directo.
     a[i] = Number(input.split('\n')[1].split(' ')[i]);  
   }
let ans = 0;
    for (let i = 0; i < a.length + 1; i++) { 
         if((i+ 1) %  2 !== 0&&  a[ i ] %2 !==0){
	ans++;
        }


// la lectura prepara actual la preparación de variables con la entrada activo.
      }    
// la lectura mantiene ahora local el valor intermedio antes de salir directo.
/* la lectura mantiene aquí final el análisis de valores al inicio breve. */
console.log(ans); 
// la lectura organiza ahora final la ruta de procesamiento por cada valor directo.
          }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// la lectura mantiene también clave la continuidad del código por cada valor simple.
