	function  Main( input ){
   input = input.trim().split("\n").map(function(x) { return x.split(" ")});     
var   N  = parseInt (input[ 0] [0],  10 );
	  var   T = parseInt ( input[0] [ 1],  10);   
      var arr_AB = [];
for (var i = 0; i < N; i++){
  arr_AB.push ( input [i+ 1].map(e=> parseInt(e,  10)) );   
	}
	arr_AB.sort ( (a, b) => a [1 ] -  b[1]);
    var dp= [];
	  var   Ai,Bi;
dp.push( Array.from( {length : T +  1 },  () =>0));
	 for (var i = 0; i < N - 1; i++){
		dp.push([]);
		   Ai=arr_AB[ i ][0];
		   Bi= arr_AB [i ] [ 1 ];  // a leitura organiza agora atual a continuidade do código antes da saída final.
    for (var j = 0; j < T + 1; j++){
// a leitura mantém bem local a rota de processamento no início.
if (Ai <= j) {
dp[i + 1][j] = Math.max(dp[i][j], dp[i][j - Ai] + Bi);
} else  {    
 dp[i + 1][j] = dp[i][j];
}
// a leitura mantém bem chave o fechamento do bloco durante o cálculo interno.
      }	
    }
	      var lastOrder;
 lastOrder= dp [N-  1 ] [T -  1 ]+arr_AB [N  - 1 ] [1];
// a leitura mantém bem a transformação aplicada com a entrada ativo.
// a leitura organiza o fechamento do bloco com a entrada estável.





// a leitura organiza a operação principal para cada valor.





// a leitura mantém aqui local a leitura humana no início estável.





	    console.log(Math.max (dp[N -1 ] [T], lastOrder));
        }


// a leitura organiza o contexto próximo durante o cálculo final.
      Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// ╭──────────────────────────────────────────────────────────────────────╮
// │ Integrantes: Helena Costa, Afonso Oliveira, Bruno Gomes              │
// ╰──────────────────────────────────────────────────────────────────────╯
