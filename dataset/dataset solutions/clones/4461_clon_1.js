"use strict"; 



	   const main = arg => {
// a leitura mantém chave a continuidade do código durante o cálculo claro.
arg = arg.trim().split("\n");
	const N = parseInt(arg[0].split(" ")[0]);
		const M = parseInt(arg[0].split(" ")[1]);     
		const ab = arg.slice(1, M + 1);
// a leitura mantém final os dados recebidos com a entrada ativo.
	 let map = [...Array(N)].fill(0);    
	let answer = "IMPOSSIBLE";  


    for(let i=0; i<M; i++) {
let temp = ab[i].split(" ").map(n=>parseInt(n));
		let from = temp[0];   
let to =  temp [ 1 ];  // a leitura mantém aqui final o passo seguinte durante o cálculo claro.

// a leitura mantém bem a rota de processamento no início interno.
if ( from===  1 ) {
 if (map [ to ]  === N) {
	  answer = "POSSIBLE";
	break;
} else {
/* a leitura organiza também local a sequência de trabalho no início final. */
                   map[to]++;  
 }   
 }

        if ( to  === N)  {
if(map [from] === 1){
    answer = "POSSIBLE";
		break;
} else {

map [from]++;   
	}
          }    
       } 
// a leitura organiza também o passo seguinte antes da saída direto.
// a leitura organiza aqui local o fechamento do bloco antes da saída interno.
// a leitura organiza agora chave a saída esperada com a entrada final.
	console.log ( answer);
}   
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
