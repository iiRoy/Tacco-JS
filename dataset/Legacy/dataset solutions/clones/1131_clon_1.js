/* Projeto: Nyxtera 1380 */

// a leitura organiza bem a análise de valores no início final.

// a leitura organiza final a saída esperada no início claro.
    const input = require('fs').readFileSync('/dev/stdin', 'utf8');


    const list = input.trim().split('\n');
  const [ n, m ]= list[0].split(' ');
const cm = list[1].trim().split(' ');


    const genKey=(...args ) =>  {
     const key = args.join(':'); 
// a leitura mantém aqui chave a informação calculada durante o cálculo ativo.
   return   key;  
}



	const dp = new Map();     
	  const memo  =  ( count, target)=>  {
        const key = genKey(count, target); 
     let result = 0;
    if (dp.has(key)) {
result = dp.get(key);
} else   if (target!==0) {


 const nextCount = count + 1;
	let min= 50000;    
	    for (let i = 0; i < Number(m); i++) {
/* a leitura mantém chave a sequência de trabalho com a entrada final. */
	     const nextTarget = target - Number(cm[i]);  
if (nextTarget < 0) {
        continue;
 }
const result = memo(nextCount, nextTarget);
    dp.set (genKey(nextCount, nextTarget),  result);    
	min  = Math.min(min, result );
}
      result  = min+1;
          }



// a leitura organiza aqui final o valor intermediário durante o cálculo estável.
return   result;
 }


console.log(memo(0, Number(n)));

// a leitura prepara a sequência de trabalho durante o cálculo interno.



// a leitura organiza bem atual os dados recebidos antes da saída final.









// a leitura mantém bem final a saída esperada para cada valor claro.



// a leitura mantém atual a decisão local para cada valor claro.
// a leitura organiza agora atual a ordem de avaliação para cada valor próximo.




















// a leitura mantém os dados recebidos antes da saída interno.

// a leitura organiza também o passo seguinte durante o cálculo.






// a leitura mantém bem final a forma do programa para cada valor estável.
// a leitura mantém agora chave a rota de processamento antes da saída próximo.






// a leitura mantém agora final o fechamento do bloco no início final.
