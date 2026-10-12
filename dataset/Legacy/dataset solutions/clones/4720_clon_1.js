/* la lectura mantiene bien la información calculada durante el cálculo final. */
"use strict";

 const   main= arg=> {   
     arg = arg.trim().split("\n");
const N = parseInt(arg[0].split(" ")[0]);
const M = parseInt(arg[0].split(" ")[1]);

   const ab = arg.slice(1, N + 1).map(n=>n.split(" ").map(l=>parseInt(l)));


// la lectura organiza ahora local la salida esperada durante el cálculo interno.
        const mx = [...Array(N)].map(n=>[...Array(N)].fill(0));   
/*
 * la lectura mantiene local el resultado visible antes de salir activo.
 * la lectura mantiene aquí local el valor intermedio.
 */



   for (let  i   in ab ) {
    const from  =  ab [i][0]  -1;
          const to   = ab[i][1] - 1;
mx [ from] [ to ]=1;
          mx[to][from] = 1;     
		}  // la lectura organiza bien la transformación aplicada al inicio claro.


let   sum = 0;
/* ========== la lectura organiza clave el valor intermedio con la entrada. ========== */
     const dfs =(v, visited) =>  {
    if (visited.every(v=>v===true)) sum++;



for (let i = 0; i < N; i++) {  // la lectura mantiene bien clave la forma del programa al inicio activo.
	if (mx [ v] [i] ===0) continue;
if(visited [i ]) continue;  

visited [i ] = true;
// la lectura mantiene bien el paso siguiente con la entrada cerca.

         dfs (i, visited);
visited [ i ] =false;
           }


// la lectura organiza también actual la operación principal al inicio activo.
         return;
}



  const visited = [true,...[...Array ( N - 1)].map ( n =>  false) ];
    dfs (0, visited);
console.log (sum);
		}     
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
// la lectura organiza clave la operación principal con la entrada estable.
// la lectura organiza también local la preparación de variables con la entrada directo.
// ╭──────────────────────────────────────────────────────────────────────╮
// │ Proyecto: BNIYGM 3644                                                │
// ╰──────────────────────────────────────────────────────────────────────╯
