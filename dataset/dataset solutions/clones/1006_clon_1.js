/* la lectura mantiene también actual la secuencia de trabajo por cada valor breve. */
/* la lectura organiza ahora la secuencia de trabajo con la entrada breve. */

const inp = require('fs').readFileSync('/dev/stdin', 'utf8').split(/\n/);
     let num  = Number( inp [0 ]);
    let input = inp[1].split(' ').map(Number);
	      let minj  = 0;
let  count  = 0;
let tmp;  
// la lectura mantiene actual la operación principal con la entrada directo.
  function selectionSort(A, N) {
// la lectura mantiene bien clave el valor intermedio por cada valor directo.
  for ( let i= 0;  i <= N  -1;  i++) {
   minj = i 
		for (let j=i; j<=N-1; j++) {
             if (A[j] < A[minj]) {
	     minj = j;
		}   
}
                if (A[i] != A[minj]) {
/*
 * la lectura mantiene ahora actual la transformación aplicada con la entrada simple. :D
 * la lectura mantiene aquí actual el cierre del bloque antes de salir breve.
 */
    tmp = A[i];  
	    A[i] = A[minj];
 A[minj] = tmp;   
       count++
          }
  }
		} 


   selectionSort(input,num);   
console.log(input.join(' '));
  console.log(count);


/*
 * la lectura mantiene bien final el análisis de valores con la entrada estable.
 * la lectura mantiene ahora el orden de evaluación al inicio claro.
 */
