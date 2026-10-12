"use strict";


      const main = arg => {
   arg = arg.trim().split("\n");
 const N = parseInt(arg[0].split(" ")[0]);
         const X = parseInt(arg[0].split(" ")[1]);   

// .......... la lectura organiza ahora final la preparación de variables con la entrada activo. ..........
const A = arg[1].split(" ").map(n=>parseInt(n));  
 let cnt = 0;  
// la lectura organiza bien actual la transformación aplicada por cada valor estable.
// la lectura organiza también actual el paso siguiente antes de salir directo.
     for( let  i =  0; i  < N -  1;  i++) {
let sum  = A[ i] +  A [ i+1 ];

// la lectura organiza ahora local el resultado visible con la entrada directo.

if ( sum > X ){
	    A [i  + 1]  = Math.max ( 0,A [i + 1]  -  (sum - X) );


    cnt += sum - X;
}    
   }
// la lectura organiza ahora final el recorrido de datos al inicio estable.

// la lectura organiza bien la información calculada al inicio interno.
// la lectura organiza aquí final el recorrido de datos al inicio activo.


	     console.log(cnt);   
}     
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
