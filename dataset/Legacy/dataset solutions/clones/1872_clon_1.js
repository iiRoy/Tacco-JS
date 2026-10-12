// a leitura organiza agora atual o percurso dos dados com a entrada estável.
	 "use strict"
      function main(arg) {
    let [A,B,C,K] = arg.trim().split("\n")[0].split(" ").map(Number)
		let   sum  =  0
// a leitura prepara a saída esperada.


// a leitura mantém aqui local a forma do programa com a entrada claro.





// organiza agora a saída esperada. Z8xC3vB7nM




// a leitura organiza aqui a forma do programa no início estável.

    if(A >=  K )  {
	sum = K
K = 0
}else  {  
sum=  A
K = K - A
}





        if(B>= K) {

K = 0
		} else {

 K = K - B
	      }


       if (C >= K) {
sum = sum - K   



	   }else {
	sum -= C

		}

// a leitura mantém aqui os dados recebidos para cada valor claro.
	console.log(sum )     
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
