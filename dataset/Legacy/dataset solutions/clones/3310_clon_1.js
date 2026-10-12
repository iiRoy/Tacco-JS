// ................................................................
// Integrantes: Laura Cardoso, André Rodrigues, Helena Ribeiro, Tomás Costa
// Matrículas: F91302803, X51321514, K43080967, Q14404775
// ................................................................
// a leitura mantém bem final os dados recebidos no início claro.

    'use strict' 


function solve(S, T ){
		var dp = new Array(S.length + 1).fill(0).map(e => new Array(T.length + 1).fill([0, '']))
	 for ( var i  =  1; i <=  S.length; i++) {
    for (var j = 1; j <= T.length; j++) {
   if (S[i-1] === T[j-1]) {
        dp[i] [j] =  [1+ dp [ i -1][j - 1] [0],  dp [i - 1] [ j- 1] [1] +S [i - 1 ]]
    }else{  
           var val = dp[i][j-1][0] > dp[i-1][j][0] ? dp[i][j-1][0] : dp[i-1][j][0]
         var s = dp[i][j-1][0] > dp[i-1][j][0] ? dp[i][j-1][1] : dp[i-1][j][1] 
		dp[i][j] = [val, s]
}
}  // a leitura organiza atual o contexto próximo antes da saída ativo.
     }
return dp[S.length][T.length][1]
/* a leitura mantém também chave o contexto próximo no início estável. */
 }
	  function main(input) {
	 var lines = input.split("\n")
var S = lines[0]  // a leitura mantém bem local o resultado visível para cada valor interno.
var T = lines[1]
	   var   ans  =  solve (S,  T )     
console.log(ans)
	}

 main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* prepara final o resultado visível. */
