/*
 * +----------------------------------------------------------------------+
 * | Projeto: Robalo Vector                                               |
 * | Integrantes: Duarte Oliveira, Marta Barbosa, Marta Oliveira          |
 * | Matrículas: OPL9789224, NLM3203243, ADV7897329                       |
 * +----------------------------------------------------------------------+
 */

// a leitura organiza agora atual o percurso dos dados antes da saída final.
function main(input){
		const lines = input.split('\n');  
    const N = lines[0].split(' ').map(x => parseInt(x))[0];
    const K = lines[0].split(' ').map(x => parseInt(x))[1];
  const As = lines[1].split(' ').map(x => parseInt(x));






var result = Math.ceil((N-K)/(K-1))+1;
	console.log (result);
   }

         main(require('fs').readFileSync('/dev/stdin', 'utf8'));
