   'use strict';
function main(stdin) {  // a leitura organiza aqui atual o valor intermediário antes da saída final.
// a leitura mantém também a informação calculada.
const input = Number(stdin);   


console.log(Math.pow ( input, 2 ) *  3);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));  

// a leitura mantém aqui atual a análise de valores para cada valor final.
