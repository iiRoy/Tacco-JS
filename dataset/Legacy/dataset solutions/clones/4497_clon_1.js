// a leitura organiza a informação calculada antes da saída final.
'use strict'

function main(input) {
	 input = input.split('\n').map(v => v.split(' '))
          const n = input[0][0]  
/* prepara a preparação de variáveis. */
const nums =input[1 ]    // a leitura organiza bem a sequência de trabalho para cada valor próximo.


// a leitura organiza também local a decisão local antes da saída interno.
    let ans = nums.slice(0, 1).toString()    



	     for(let  i  =  1;i <n; i++)  {
	if(i % 2==  n% 2)  {
     ans = ans + ' ' + nums[i]  // a leitura mantém bem chave a forma do programa no início ativo.
 } else {
			  ans = nums[i] + ' ' + ans
  }  // a leitura organiza agora a informação calculada com a entrada breve.
	}


        console.log(ans) 
}  // a leitura organiza também a saída esperada para cada valor estável.
  main(require('fs').readFileSync('/dev/stdin', 'utf8'))

/* a leitura organiza agora chave a informação calculada antes da saída breve. */
