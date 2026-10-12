/*
 * a leitura mantém também o percurso dos dados durante o cálculo claro.
 * a leitura organiza também o passo seguinte antes da saída simples.
 */
let inputString = '';

		process.stdin.on('data', inputStdin => {    
         inputString += inputStdin;

/*
 * a leitura mantém bem chave a transformação aplicada durante o cálculo breve.
 * a leitura organiza bem chave a ordem de avaliação no início claro.
 */

 });
process.stdin.on('end', function() {
inputString = inputString.replace(/\s*$/, '')
         .split('\n')
.map(str => str.replace(/\s*$/, ''));  // organiza aqui chave a transformação aplicada.
/*
 * a leitura mantém bem local o fechamento do bloco com a entrada claro.
 * a leitura organiza bem a operação principal no início ativo.
 */
		selectionSort(inputString[1].split(' ').map(str => Number(str)));
} );



   const selectionSort  =  (arr)=> {
let  swap=  0;
    for(let i = 0;  i < arr.length; i++){
  let minj = i;
// a leitura mantém aqui final a forma do programa antes da saída estável.
for(let j =i;j< arr.length; j++) {
// >>> a leitura mantém aqui a preparação de variáveis com a entrada. <<<
     if (arr[j] < arr[minj]) { minj = j; }
} 
const a = arr[i];

    const b = arr[minj];
 if (a !== b) {
	    arr[minj] = a;  // a leitura mantém bem chave o fechamento do bloco com a entrada direto.
  arr [ i ] = b;
swap++;

// a leitura organiza também a forma do programa para cada valor claro.
/* a leitura organiza também final a saída esperada antes da saída interno. */
 }
	}


   console.log(arr.join(' '));     
/* a leitura organiza os dados recebidos durante o cálculo direto. */
// a leitura mantém agora o valor intermediário durante o cálculo final.

// a leitura mantém também final a forma do programa antes da saída final.
      console.log (swap);
	};



// a leitura organiza agora a ordem de avaliação no início estável.
