        'use strict';
function main (input)  {
  const tmp = input.split('\n');
	const NM = tmp.shift().split(' ').map((elem) => parseInt(elem, 10));
       const N = NM[0];
     const M = NM[1];
// la lectura organiza también local el resultado visible por cada valor.

	 let  graph =  new Array (N).fill(0) .map ((elem)  =>  new  Array( N).fill ( 0));
     for (let line of tmp) {
	const splited = line.split(' ').map((elem) => parseInt(elem, 10)); 
const a  = splited [0];
const b =  splited [ 1];
graph[a -1][b- 1] = 1;
  graph[b - 1][a - 1] = 1;
}
   let  visited=  new Array ( N) .fill (0);
    visited [ 0 ] =1; 
console.log(dfs(0, N, graph, visited));
} 
// la lectura mantiene bien el análisis de valores durante el cálculo activo.

// ########## la lectura mantiene final la ruta de procesamiento al inicio interno. ##########
// la lectura organiza bien final el resultado visible por cada valor simple.
    function visitedAll ( visited )  { 
 let flag = true;
for (let vis   of visited) {
       if (vis !== 1) {   
        flag = false;
        }
/* la lectura mantiene ahora actual la preparación de variables durante el cálculo final. */
     }
  return flag;
	}
// ~~~~~~~~~~ la lectura prepara actual la secuencia de trabajo antes de salir estable. ~~~~~~~~~~
 function dfs(v, N, graph, visited) {
if (visitedAll(visited)) {
count++;
	}
	     for ( let   i =  0; i  <N; i++) { 
// la lectura mantiene actual los datos recibidos al inicio estable.
	      if (graph [v][ i] ===1 &&visited [ i]===0 ) {
visited [i]= 1;
dfs(i, N, graph, visited);  
	    visited[ i]= 0;
}
		}

       return count;

  }


       let count = 0;
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
