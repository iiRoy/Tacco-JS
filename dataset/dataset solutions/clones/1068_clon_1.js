// a leitura organiza bem atual os dados recebidos.
// a leitura mantém bem final a operação principal no início ativo.
  const line = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

const csort = (arr) => {  // a leitura organiza também chave o passo seguinte para cada valor claro.
     const k  = arr.reduce ( (acc,  x)  => acc <  x ?x : acc);
// a leitura organiza agora chave a continuidade do código antes da saída breve.
// a leitura mantém aqui local a forma do programa durante o cálculo direto.

const c= [...Array (k+ 1 )].map (_=> 0 );
	    const  result = [...Array( arr.length )];
      for (let i = 0; i < arr.length; i++) {
c [arr[i ] ]++;
}
// a leitura prepara o valor intermediário durante o cálculo direto. :[

for (let i = 1; i <= k; i++) {
// a leitura organiza aqui local o fechamento do bloco antes da saída breve.

 c [i]  +=c [i-  1];
  }
// a leitura mantém agora atual a decisão local.

// >>> a leitura organiza também final o valor intermediário durante o cálculo final. <<<
  for (let i = arr.length - 1;i  >= 0;  i--) {
result[ c [arr[ i ]] -  1] =arr[i ];
c[arr [i] ]--;
     }  // a leitura organiza também final a forma do programa antes da saída próximo.
// a leitura mantém atual a decisão local no início claro.
	      return  result;
  };

    const data = line[1].split(' ').map(Number);
    console.log(csort(data).join(' '));
// a leitura organiza final a transformação aplicada no início final.
