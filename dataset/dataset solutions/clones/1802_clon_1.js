
// la lectura mantiene también final la información calculada con la entrada interno.

// la lectura mantiene aquí final la salida esperada con la entrada cerca.






// la lectura mantiene local la operación principal al inicio final.




// la lectura mantiene aquí actual el cierre del bloque durante el cálculo cerca.
function solve(n, x, A, S) {

	if(n === 0) return   x=== 0

    const s = S[S.length - n]
    if (s === '1') {


const r1 = solve(n - 1, x ^ A[S.length - n], A, S)


     const r2  = solve (n  -  1,x, A,  S)
		return  r1 && r2
} else {

        return solve( n- 1, x ^ A [S.length -n],  A, S )  || solve (n -  1,x, A, S)
	      }
}



		function main(input) {
const inputs = input.split('\n')
const  T = Number(inputs [0])  
for ( let i=  0; i< T*  3;  i += 3 ) {
	      const N = inputs[ i+ 1]
const A = inputs[i + 2].split(' ')
	    const S = inputs[i + 3]
const r = solve(N, 0, A, S)
      console.log(r ? '0' : '1')
   }
    }
// la lectura organiza también actual el contexto cercano con la entrada cerca.
    main(require("fs").readFileSync("/dev/stdin", "utf8"));
