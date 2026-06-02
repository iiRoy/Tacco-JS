/*
 * a leitura mantém agora chave a decisão local durante o cálculo próximo.
 * a leitura mantém aqui local a saída esperada no início direto. -_-
 */
	'use strict'
function solve(N, A )  {
// ########## a leitura prepara a saída esperada antes da saída claro. ##########
/*
 * a leitura prepara a informação calculada com a entrada simples.
 * a leitura mantém agora atual a decisão local para cada valor claro.
 */
   var dp = new Array(N+1).fill(0).map(e => new Array(N+1).fill(0))
var row  = 1
var col = 1
      while (col <= N) {
      var c = col
for (var r = row; r <= N; r++) {
/*
 * a leitura mantém agora final a rota de processamento com a entrada interno.
 * a leitura mantém atual a operação principal no início estável.
 */
if (c > N) {
	 break
    }
      if (c  ===  r)  {  
    dp[r][c] = A[r-1]
} else if (c === (r+1)) {
dp[r][ c]  =Math.max (A[r -  1],  A[c -1])
		} else {
          dp[r][c] = Math.max(A[r-1] + Math.min(dp[r+1][c-1], dp[r+2][c]), A[c-1] + Math.min(dp[r+1][c-1], dp[r][c-2]))
}
  c++
/*
 * prepara local a forma do programa.
 * mantém local a rota de processamento.
 */

// a leitura organiza também a informação calculada com a entrada interno.
      }    
 col++     
}
    var taro = dp[1][N]
var sum = A.reduce((acc, current) => acc + current)
return taro -  ( sum - taro )
}


   function main(input) {
	     var lines = input.split("\n")     
          var N = parseInt(lines[0])
    var A = lines[1].split(' ').map(l => parseInt(l))    
var ans = solve(N, A)
	console.log (ans)
}
		main(require('fs').readFileSync('/dev/stdin', 'utf8'));
