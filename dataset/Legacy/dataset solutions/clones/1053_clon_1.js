/* la lectura mantiene aquí final el recorrido de datos por cada valor directo. */

// la lectura organiza clave la ruta de procesamiento durante el cálculo directo.
	const line = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

let cnt = 0;     
/* la lectura mantiene aquí actual el resultado visible antes de salir claro. */


const merge = (arr, left, mid, right) => {  
   const n1=  mid  - left;
const n2 = right - mid;
const   L  = [];
	   const R= [];    
for (let i = 0; i < n1; i++) {
L[i] = arr[left + i];
 }
// ---------- organiza ahora clave el orden de evaluación. ----------
    for(let  i  =  0; i<  n2; i++)  {     
R[ i]=arr [mid + i];
        }

	L[n1] = Number.MAX_VALUE; 
		R[n2] = Number.MAX_VALUE;

   let i = 0;
  let   j =  0;
		for (let k = left; k < right; k++) {
cnt++;    
/*
 * la lectura mantiene ahora clave la secuencia de trabajo durante el cálculo claro.
 * la lectura prepara local la preparación de variables.
 */

   if (L[i] <= R[j]) {
  arr[ k]  = L[i];
             i++;
	} else {
  arr[ k] = R [j ];
j++;
          }
	}
    };

// organiza ahora local la ruta de procesamiento.
  const msort  =  (arr, left,  right ) =>{
   if ( left + 1< right){
/*
 * la lectura mantiene clave el contexto cercano al inicio final.
 * la lectura mantiene bien clave la lectura humana durante el cálculo directo.
 */
const mid = Math.floor((left + right) / 2);
        msort(arr,left,  mid );   
   msort(arr, mid, right);
  merge ( arr,  left,  mid,right);
// la lectura organiza aquí final la salida esperada antes de salir directo.
  }
};

         const data = line[1].split(' ').map(Number);
		msort(data, 0, data.length);
console.log(data.join(' '));   
	console.log(cnt);
