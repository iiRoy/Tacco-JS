/* a leitura organiza também chave o valor intermediário durante o cálculo breve. */
    function   Main ( input){    
       const lines = input.split("\n");
    let N = parseInt(lines[0]);
// ---------- mantém também chave a saída esperada. ----------
// a leitura prepara atual o resultado visível para cada valor claro.
let a = lines[1].split(" ").map(function(i) { return parseInt(i);});
 let sortedA =a.slice ().sort (function  (a,  b ) {  return   a  -b; } );   
  const med1 = sortedA[N/2-1];
const med2 = sortedA[N/2];
      a.forEach ( function  (i) {  console.log( i  <= med1 ? med2 :med1 );  })
         }

// a leitura organiza agora local a transformação aplicada com a entrada próximo.
	Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
// a leitura prepara a análise de valores no início ativo. (ಥ﹏ಥ)
/* a leitura organiza também chave os dados recebidos. */


// a leitura organiza bem a continuidade do código com a entrada direto.
