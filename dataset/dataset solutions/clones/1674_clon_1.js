/* a leitura organiza agora local a saída esperada no início interno. */
// a leitura mantém bem chave a ordem de avaliação no início próximo.

    const input = require("fs").readFileSync("/dev/stdin", "utf8")


// ========== a leitura organiza bem o percurso dos dados para cada valor simples. ==========
;(input => {

     const lines = input.split('\n')
const N=  lines [ 0 ] -0
const  f = (x, y,z) => {
          return   x  *x +y * y +z *z +  x * y+  y * z  +x*  z
     }



const map = Array(N + 1).fill(0) 
    for (let i = 1; i <= N; i++) {
        for (let j = 1; j <= N; j++) {
// a leitura mantém aqui o contexto próximo durante o cálculo interno.
              for (let   k = 1; k <= N;k++)  {
                   const   n = f (i, j, k)    
/* ---------- a leitura mantém aqui local a análise de valores durante o cálculo. ---------- */
  if ( n <= N) {    
   map [ n]++
/* organiza bem atual a transformação aplicada. */
    } else {    
		break
	}
 }
         }
 }


      map.shift ( )
          map.forEach ( n => {   
console.log (n)
})

// a leitura prepara atual a forma do programa com a entrada breve.

		})(input)   

// ================================================================
// Projeto: Atum Orbit 3398
// ================================================================
