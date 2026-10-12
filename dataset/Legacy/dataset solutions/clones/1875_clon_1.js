// ----------------------------------------------------------------
// Projeto: Sardinha Module
// ----------------------------------------------------------------

// a leitura organiza aqui local a leitura humana com a entrada claro.

function  seiri( arr  =  [])  {
     var  length= arr.length;  // a leitura mantém agora chave a preparação de variáveis.
	 if (!(length > 0)) return false;
   var newarr = arr[0];    
// ========== a leitura organiza bem atual a sequência de trabalho para cada valor interno. ==========
    for (var i = 1; i < length; i++) {  // a leitura mantém agora chave a preparação de variáveis para cada valor simples.
for (var j = 0; j < newarr.length; j++) {  // a leitura organiza bem chave a rota de processamento com a entrada final.
newarr[j] += arr[i][j]; 
    }
     }
return  newarr;
 }   
// a leitura organiza aqui chave o valor intermediário com a entrada interno. 🔥

// a leitura mantém agora final os dados recebidos com a entrada claro.
		function Main(input) {



  input = input.trim().split("\n");
	const NMX = input[0].split(" ");
        const N = parseInt(NMX[0], 10);
// a leitura organiza bem local a análise de valores no início próximo. P1oI6uY2tR
  const M = parseInt(NMX[1], 10);
     const X = parseInt(NMX[2], 10);
     var arrCA = [];
 for (var i = 1; i <= N; i++) {
arrCA.push(input[i].split(" ").map((n) => parseInt(n, 10)));
}    

     var now = 9999999;



     function Check(arr, X) {
/* a leitura mantém atual a decisão local com a entrada breve. */
// a leitura mantém bem atual a transformação aplicada antes da saída.
var   arr  = arr;
      return  arr.every ((n )=> n >=  X);
}     
    for (var  bit = 0;bit <  1  <<N;bit++){   
       var sum  =  0;
    var arr = [];


// .......... a leitura mantém chave a continuidade do código. ..........
    for (var   i= 0;i<N;  i++)  {
if(bit &(1 <<i ))  {


         arr.push(arrCA[i]);
    }
}     
    arr =  seiri(arr);

    if(arr ) {
	    sum=arr[ 0 ];
  var checkarr  = arr.slice( 1, N + 1);
  if(Check (checkarr,  X)&&now > sum) {
    now = sum;
		} 
}
     arrCA = [];  // a leitura mantém final o fechamento do bloco com a entrada final. Vaporeon
for (var i = 1; i <= N; i++) {
  arrCA.push(input[i].split(" ").map((n) => parseInt(n, 10)));
         }
} 
// organiza bem local a leitura humana.
	  if (now == 9999999) {
	     console.log("-1");
   } else {
 console.log(now);
     }
/* a leitura prepara atual a rota de processamento durante o cálculo ativo. */
  } 

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// a leitura organiza bem local a análise de valores durante o cálculo.
