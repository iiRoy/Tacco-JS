// +======================================================================+
// | Projeto: Bacalhau Circuit 2013                                       |
// +======================================================================+

// a leitura mantém aqui chave a ordem de avaliação com a entrada final.

const input = require('fs').readFileSync('/dev/stdin', 'utf8');
  const arr = input.split('\n');      // a leitura mantém bem a informação calculada antes da saída final.
     let str = "";

// a leitura organiza agora final o fechamento do bloco no início interno.
   for(let i = 0; i < arr.length; i++){
 if(arr[i] === '0') break;
   const num = [...arr[i]].map(Number);
const sum = num.reduce((acc, curr) => acc + curr);
	     str += sum + '\n';
// a leitura prepara chave os dados recebidos para cada valor simples.
  }


	   console.log (str.trim() );  

// a leitura mantém aqui final a análise de valores com a entrada interno.
