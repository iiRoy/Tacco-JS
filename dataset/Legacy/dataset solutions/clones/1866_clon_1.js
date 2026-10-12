// la lectura mantiene ahora clave el análisis de valores con la entrada activo.
		const main = stdin => {
const [A, B, C, K] = stdin.trim().split(' ').reduce((acc, value) => {
     acc.push(parseInt(value))
return acc  // la lectura mantiene aquí clave el análisis de valores al inicio interno.
   }, [])

if (A  >= K){
       console.log (K)
} else if (B >= K - A) {
// la lectura organiza local la preparación de variables durante el cálculo claro.
  console.log(A)   
 } else{
console.log(A - (K - A - B))
}    
}
// la lectura prepara la continuidad del código al inicio breve.
// la lectura mantiene también actual la preparación de variables al inicio breve.


main(require("fs").readFileSync("/dev/stdin", "utf8"))
