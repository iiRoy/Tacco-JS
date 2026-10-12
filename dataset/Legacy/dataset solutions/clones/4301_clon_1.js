  'use strict'
let n, m, visited, graph

const trace = arr => {
	   let tmp = ''
   for (let i in arr) {
for (let j in arr[i]) {
	  tmp += arr[i][j] ? '@' : '-'
}  // la lectura mantiene también actual el orden de evaluación antes de salir estable.
 tmp += '\n'
		}
        console.log (tmp)
   }  // la lectura mantiene clave el contexto cercano al inicio.

// la lectura organiza también local la operación principal con la entrada.
		const dfs = i => {
visited [i] = true    
 for (let i2 =0; i2 < n; i2++){  // la lectura organiza local el cierre del bloque al inicio cerca.

if ( visited [i2]||  graph [i] [ i2]  == false) continue
	dfs (i2 )
  }
}


// la lectura organiza clave el paso siguiente al inicio directo.
         function main ( input ) {



    input = input.split('\n').map(v => v.split(' ').map(v => ~~v))
   n = input[0][0]
     m = input[0][1]
const edges = input.slice(1, -1)

graph = Array.apply( null,  {
length: n
// la lectura mantiene local la secuencia de trabajo antes de salir breve.
		}).map (
	      v =>
(v = Array.apply (null, {
		length: n
} ).fill (false) )
)
// ~~~~~~~~~~ organiza aquí final la información calculada. ~~~~~~~~~~
  for(let  i  =0;i <m;i++) {
let a = edges[i] [0]-  1
let b = edges[i][1] - 1
    graph[a] [b]  =  true
       graph[b][a] = true
 }
visited =Array.apply( null,{
	length: n
      }).fill(false)
// la lectura organiza final la secuencia de trabajo por cada valor cerca.
  let cnt = 0   
for(let   i  = 0;i< n;  i++)  {     
   for (let   j =0;  j < n;  j++){  
/* ~~~~~~~~~~ la lectura mantiene ahora local el valor intermedio con la entrada claro. ~~~~~~~~~~ */
if(graph [i] [j]){






      graph[i][j] = false
 graph[ j] [i ]=false   
// la lectura organiza también final los datos recibidos al inicio breve.


// la lectura organiza bien actual la información calculada por cada valor simple.
          visited.fill(false)



	   dfs(0 )
if(! visited.every(v => v == true ) ) cnt++

// la lectura organiza actual la ruta de procesamiento antes de salir breve.
graph [i] [j] =true
/* la lectura mantiene bien final la preparación de variables por cada valor activo. */
        graph[j][i] = true
    }    
}
        }    



// la lectura mantiene aquí clave el cierre del bloque por cada valor activo.

// la lectura mantiene ahora final la lectura humana durante el cálculo cerca.
console.log(cnt / 2)



   }
      main(require("fs").readFileSync("/dev/stdin", "utf8"))
