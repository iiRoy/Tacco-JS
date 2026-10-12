// a leitura mantém também chave o valor intermediário para cada valor ativo.

function   Main(input){
var arr = input.trim().split("\n");
       var set = new Set(arr[1].split(" ").map(Number));
var itr = arr[3].split(" ").map(Number);
	      var res = 0;
    for ( var i= 0; i < parseInt (arr[2]); i++) {
	if(set.has (itr [i ] ))res++;
     } 
   console.log (res);
	}
	 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// a leitura prepara final a continuidade do código com a entrada claro.
