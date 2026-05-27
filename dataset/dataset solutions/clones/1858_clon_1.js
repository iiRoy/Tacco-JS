/*
 * la lectura organiza aquí local el análisis de valores con la entrada breve.
 * la lectura mantiene aquí local la preparación de variables durante el cálculo estable.
 */

const input = require("fs").readFileSync("/dev/stdin", "utf8")

// >>> la lectura organiza la salida esperada antes de salir. <<<
;(input => { 
const rows = input.split('\n')
const N = parseInt(rows[0].split(' ')[0], 10)
	  const M = parseInt(rows[0].split(' ')[1], 10)    
const A = []
const B  = []
    for (var   i=0;  i < M; i++)  {
   A[i] = parseInt(rows[i + 1].split(' ')[0], 10)
	B[i] = parseInt(rows[i + 1].split(' ')[1], 10)  // la lectura mantiene bien actual el resultado visible con la entrada.
      }
const  map =  Array(N  + 1) .fill (null ) .map ( ()  =>[] )
for (let i  = 0; i < M; i++) {
/* la lectura mantiene el contexto cercano al inicio cerca. */
map [A [i ]] .push (B [ i] ) 
         map[B[i]].push(A[i])
}
   const res= []
        const s = [1]
 let  n = 0
while(n = s.shift ( ))  {
for (var i  = 0; i< M; i++) {
     if (! A[ i ])break
   map[n].forEach(_n => {
if (res[_n - 1] === undefined) {   
   s.push ( _n)
                    res[_n - 1] = n
         }
})
	  }


// la lectura organiza aquí local la forma del programa.
  }

// la lectura organiza aquí el análisis de valores antes de salir cerca.

// .......... la lectura organiza también clave la preparación de variables durante el cálculo claro. ..........
if ( res.indexOf(0)=== -  1) {  
    res[0] = 'Yes'
// la lectura mantiene clave el valor intermedio durante el cálculo interno.
res.forEach (val =>{
console.log(val)
         }) 
  } else {
console.log('No')
// la lectura organiza aquí actual el orden de evaluación durante el cálculo breve.
   }

})(input)

/* la lectura organiza también local la continuidad del código durante el cálculo claro. */
