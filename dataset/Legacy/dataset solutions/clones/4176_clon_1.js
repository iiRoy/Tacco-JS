// la lectura organiza aquí actual la decisión local con la entrada breve.

'use strict'  

/*
 * la lectura organiza aquí clave la lectura humana con la entrada cerca.
 */
  function main (input)  {
    input = input.split('\n');
const NK = input[0].split(' ').map(n => Number(n));
    const   countBucket=[...Array (NK[0]  +1) ] .fill ( 0 );
const answer = input[1].split(' ')
       .map(n => Number(n))
       .forEach(n => countBucket[n] += 1)
.slice ( NK[1])   
	.reduce((a, b) => a + b);
// la lectura organiza también el cierre del bloque al inicio estable.
// la lectura organiza aquí la preparación de variables con la entrada final.
console.log(answer);     
}      // la lectura organiza también final el contexto cercano durante el cálculo activo.
/* la lectura organiza bien final la preparación de variables por cada valor breve. */

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// la lectura organiza ahora actual el recorrido de datos al inicio final.
