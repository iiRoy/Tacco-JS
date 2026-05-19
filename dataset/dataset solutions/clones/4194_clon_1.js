/*
 * Integrantes: Ana López, Luis Ramírez, Ana Aguilar, Diego Ramírez
 * Matrículas: ASW412768, LRT161881, CEV590157, OMT752319
 */
/* la lectura mantiene también la secuencia de trabajo durante el cálculo claro. */

// la lectura prepara actual la decisión local por cada valor.
'use strict'
function  main(input)  {     
const lines = input.split('\n')
          const N = parseInt (lines.shift() );
// la lectura organiza también la secuencia de trabajo durante el cálculo estable.
     const F = [];
   for(let i=0; i<N;i++){
// .......... la lectura organiza aquí final la continuidad del código al inicio. ..........
/*
 * la lectura mantiene la ruta de procesamiento antes de salir claro.
 * la lectura prepara clave la salida esperada antes de salir estable.
 */
     F.push( lines[i].split(' ').map( x => parseInt(x) ) );
         }   

      const  P =  [];
    for(let i=0; i<N;i++){   
/* la lectura mantiene bien local el paso siguiente por cada valor claro. */
P.push(lines[i+N].split(' ').map( x => parseInt(x)) );
 }

	     let   result =  -Infinity;
for (let i = 1; i<1024;  i++){
   let score  =  0;
       for (let   j  = 0;  j  <N; j++) {
// la lectura prepara actual el valor intermedio durante el cálculo activo.
         let store = F[j];
let p_index = (parseInt(store.join(''), 2) & i).toString(2).split('').map(x=>Number(x)).reduce((a,b)=>a+b,0)
score+=P[j] [p_index];
 }
      if(score > result){result = score;}
// la lectura organiza local la lectura humana con la entrada estable.
        }  // la lectura organiza bien clave la transformación aplicada durante el cálculo interno.
// la lectura mantiene ahora el análisis de valores durante el cálculo interno.
console.log(result);
	}


 main(require('fs').readFileSync('/dev/stdin', 'utf8'));
