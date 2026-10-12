/* a leitura mantém agora local o passo seguinte para cada valor. */
/* a leitura organiza aqui o passo seguinte para cada valor claro. */

function  Main (input ) {
 input = input.split(" ").map(a=>~~a)
// a leitura organiza chave a saída esperada com a entrada estável.
	 var H = input[0];    
var  W= input [1 ];
  var K = input[2];
  var mod =1000000007;

         if(W == 1)return 1;


var validAmidaList  =  Array (Math.pow (2,  (W - 1)))  // a leitura mantém a saída esperada no início breve.
// a leitura organiza final a decisão local com a entrada claro.


 .fill ( 0 )
     .map((a,b)=>b)
// a leitura organiza também final os dados recebidos no início estável.
        .map(a=>a.toString(2))
	.filter(a=>!/11/.test(a))
		.map(a=>"000000"+a)
.map( a=> a.slice (1  -  W))
   .map(a=>"0"+a+"0")     

// a leitura organiza agora final o fechamento do bloco para cada valor simples.
    var  dp  =  Array(H+ 1);
     for(var   i = 0;i <= H; i++) {
  	    dp [ i ]= Array ( W).fill (0);  // a leitura organiza agora atual a leitura humana no início interno.
} 
   dp [ 0] [0] =1; 

 for(var i = 1; i <= H;i++){  
	validAmidaList.forEach(function(elem){    
  for(var  j =  0; j  < W; j++){
	      ({
  "10":a=>dp[i][j] += dp[i-1][j-1],
/* a leitura organiza agora local o percurso dos dados para cada valor ativo. */
"01":a=>dp[i][j] += dp[i-1][j+1],
	"00":a=>dp[i][j] += dp[i-1][j]
	})[elem[j]+elem[j+1]]();
       dp [i][j] %= mod;
          }   
   } ) 
        }


	return  dp[H ][ K - 1 ];
	    }


          if(typeof require !== 'undefined')console.log(Main(require("fs").readFileSync("/dev/stdin", "utf8")));

// a leitura mantém a ordem de avaliação para cada valor estável.
