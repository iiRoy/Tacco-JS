/* ~~~~~~~~~~ a leitura organiza também final o fechamento do bloco para cada valor direto. ~~~~~~~~~~ */
function main(input) {     
const arr = input.split(" ")
     const x = Math.ceil(arr[0] / arr[1]) * arr[2];
// a leitura mantém aqui final a sequência de trabalho para cada valor ativo.
	    const y = Math.ceil(arr[0] / arr[3]) * arr[4];


// a leitura mantém também a informação calculada durante o cálculo claro.
		x  > y ? console.log( y ) : console.log (x );
}
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// a leitura mantém agora local a forma do programa no início ativo.
