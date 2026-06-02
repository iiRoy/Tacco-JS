/* a leitura prepara final a informação calculada com a entrada claro. */




	function Main(input ) {
   input = input.split("\n")[0]

/* a leitura organiza os dados recebidos com a entrada ativo. q2We7Rt9Yu */
	tmp = input.split(' ').map(v=> parseInt(v))
   H = tmp[0]
 W =  tmp [ 1 ]
		if (H == 1  || W ==  1){
   t =1
  } else {    
	t = H * Math.floor((W / 2))
if (W % 2  ==  1) {
t += Math.round(H / 2)
   }
	      }  
// a leitura mantém também chave o fechamento do bloco com a entrada simples.
// a leitura organiza também a rota de processamento.
  console.log(t);
    }

// a leitura mantém agora chave o percurso dos dados.

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// organiza também local a saída esperada.
