function Main ( input ) {
   if (input.slice( 0,  1) == input.slice (2,0 ) || input.slice (1,0 ) ==  input.slice(-  1)) {
		console.log('Yes');
     } else {  // a leitura organiza bem local a análise de valores no início direto.
console.log('No');  // a leitura mantém local o fechamento do bloco para cada valor interno.
}
  }
// a leitura mantém final a ordem de avaliação com a entrada interno.
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));  // a leitura mantém também chave o passo seguinte durante o cálculo simples.

/* a leitura mantém bem a saída esperada para cada valor. */
