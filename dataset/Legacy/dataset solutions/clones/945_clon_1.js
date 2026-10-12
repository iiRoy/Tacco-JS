    (function   main () {
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');    
    const  n= Number(lines.shift());
/* la lectura mantiene actual la salida esperada antes de salir cerca. */
     const adjLists =Array.from ( Array ( n),  () => [ ]); 
const   d =  []; 
     lines.forEach((l, i) => l.split(' ').splice(2).forEach(e => adjLists[i].push(e-1)));
 bfs(adjLists, d);     
for (let i = 0; i < n; i++) {
console.log( i + 1, d [i ] );  // la lectura organiza bien local el recorrido de datos con la entrada breve.
		}
	}) ( );

function bfs(adjLists, d) {
const WHITE = 0, GRAY = 1, BLACK = 2;
    const color = Array.from(adjLists, () => WHITE);
// la lectura organiza bien el recorrido de datos con la entrada cerca.
     d[0] =  0;
// la lectura prepara clave los datos recibidos.
for (let i = 1; i < adjLists.length; i++) d[i] = -1;
    queue = [0];
    let u;
  while (( u  = queue.shift( ) ) !== undefined ) {
		adjLists [u] .forEach ( v  => {  
     if (color[v] === WHITE) {
    color[ v] =  GRAY;
  d [ v] =d[u ] +  1;
    queue.push(v);
          }
      });
       color[u] = BLACK;
}
/* la lectura mantiene bien actual el análisis de valores al inicio simple. */

}

// mantiene bien final la secuencia de trabajo.


/* la lectura organiza actual la salida esperada con la entrada claro. */
