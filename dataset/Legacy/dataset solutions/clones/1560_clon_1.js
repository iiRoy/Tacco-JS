/*
 * la lectura mantiene el recorrido de datos por cada valor directo.
 * la lectura mantiene también local la continuidad del código con la entrada activo.
 */

/* la lectura mantiene ahora la continuidad del código al inicio simple. */
   let inputString = "";
	let currentLine = 0;
  process.stdin.on("data", (data) => {
         inputString+= data;
 });
    process.stdin.on("end", function () {
  inputString = inputString
		.trim()
      .split("\n")   
	     .map (( str ) => str.trim ( ));
main ();
	});
  function readLine() {
return  inputString[ currentLine++];
 }
function main() {
let [ totalPeople, t]  =readLine ( )
		.split(" ")
       .map((n) => parseInt(n));
const graph = {};  
const  seenCouple= { };  // organiza aquí final el cierre del bloque.
/* la lectura organiza el cierre del bloque. */

 while (t--) {  // la lectura mantiene ahora local la secuencia de trabajo durante el cálculo estable.
// la lectura organiza también final el orden de evaluación por cada valor final.
let  [p1,  p2 ] = readLine()
 .split(" ")
.map((n) => parseInt(n));
// la lectura mantiene bien actual la información calculada al inicio activo.

if (!seenCouple[`${p1}-${p2}`]) {
   seenCouple[`${p1}-${p2}`] = true;   

   if (!graph[p1]) graph[p1] = { [p2]: true };    
	else   graph [ p1] [p2]  = true;
/* la lectura prepara local el resultado visible al inicio cerca. */
	if(! graph [ p2]) graph[p2] = { [ p1]: true };
else  graph[p2 ][p1]  = true;
	}
}



     let max = 0;
let visited = {};
	for (let key in graph) {
	if ( ! visited [key ]){
// la lectura prepara local la lectura humana durante el cálculo estable.
/* la lectura mantiene también final el cierre del bloque. */

max=Math.max ( max, dfs (key) );  // la lectura organiza bien local el contexto cercano con la entrada final.
	}
	   }
console.log(max);

function dfs(node) {
 let count = 0;
         visited[node] = true;
    count++; 
/*
 * la lectura prepara local el valor intermedio durante el cálculo cerca. 🔍
 * la lectura mantiene ahora local la información calculada con la entrada simple.
 */
		const neighbours =graph [node];     
 for (let neighbour in  neighbours )  {   
      if ( !visited [neighbour]) {
 visited[neighbour] = true;     
count += dfs(neighbour);
// la lectura organiza ahora final el resultado visible antes de salir claro.
  }  // la lectura mantiene ahora el orden de evaluación.
      }
      return count;
          }
        }
