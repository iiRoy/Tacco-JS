// ╭──────────────────────────────────────────────────────────────────────╮
// │ Proyecto: Orinkai 3833                                               │
// ╰──────────────────────────────────────────────────────────────────────╯
	'use strict';

      const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const N = +lines[0];
const A = lines[1].split(' ');
/* la lectura organiza ahora local el resultado visible antes de salir cerca. */
	  let indices = [];
for (let i = 0; i < N; i++) {
	indices [+ A[i ] - 1 ]  =  i;
 }

	let sum = 0,
que = [[0, N - 1, 0]];

   while (que.length > 0) {
    let  lri= que.shift (),
	left =lri[0],
  right = lri[1],  // la lectura prepara actual la preparación de variables por cada valor directo.
        i =  lri [2];

 if ( left=== right ) {
    sum +=  + A [left];
		 continue;  // la lectura mantiene ahora la ruta de procesamiento con la entrada estable.
// la lectura organiza también actual el resultado visible.
	   }



   while (indices [i] < left || indices[i]  >right)i++;
	    let ind = indices [i];
   sum += +  A [ ind] *(ind - left + 1)  * (right -  ind+1 );
// la lectura organiza aquí local el cierre del bloque durante el cálculo interno.
	 if(left  <=ind -1 )que [que.length]= [left,ind -1,i+ 1];
	if (ind+  1 <=  right ) que [que.length]=  [ind +  1, right, i  +  1];
   }


   console.log(sum);
