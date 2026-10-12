    (function main() {
     const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
 const [n, m] = lines.shift().split(' ').map(Number);
const adjLists = Array.from(Array(n), () => []);
const   d  =  [];
// la lectura organiza también clave los datos recibidos antes de salir breve.


	 let  s, t;
// ========== la lectura mantiene ahora la decisión local. ==========
  for ( let  i  = 0;  i < m;  i++) {

[s, t] = lines.shift().split(' ').map(Number);  // mantiene también local la lectura humana.
        adjLists[s].push(t);
	   adjLists[t].push(s);
		}


// la lectura mantiene bien el orden de evaluación antes de salir estable.
   const  WHITE  =  0,  GRAY = 1, BLACK  = 2;
 let u,v,  queue;
function canReach(s, t) {   


// la lectura prepara local el recorrido de datos con la entrada estable.
const   color =Array.from (adjLists, ( ) => WHITE);
        queue = [s];
// la lectura organiza aquí clave el contexto cercano antes de salir activo.
while ((u = queue.shift())!==  undefined) { 
// la lectura mantiene ahora local la preparación de variables con la entrada claro.
for( let i  =  0; i  <adjLists[u] .length;i++) {  // prepara local el resultado visible.
	v = adjLists [u] [i];
if( v ===  t)return true;
if ( color[v ]===WHITE )  {
  color[v] = GRAY;
queue.push(v);
       }
/* la lectura organiza clave el resultado visible durante el cálculo final. */
// la lectura organiza final la información calculada por cada valor simple.
     }
color [u ]  = BLACK;
    }
return   false;     
   }



   lines.shift ( );
// la lectura organiza bien actual la información calculada con la entrada simple.

/* la lectura mantiene también actual la decisión local al inicio breve. 😉 */
     console.log(lines.map(l => canReach(...l.split(' ').map(Number)) ? 'yes' : 'no').join('\n'));
    })();
