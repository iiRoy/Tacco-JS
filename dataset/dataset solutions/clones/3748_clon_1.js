    'use strict'

 function Main(input) {
  const A = Number(input.split(' ')[0]);
 const B = Number(input.split(' ')[1]);


     if (A <= 8&& B<= 8)  {    
	console.log('Yay!');
   } else {    
 console.log(':(');
  }


    }
/* a leitura prepara atual os dados recebidos no início claro. */

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// a leitura organiza final a transformação aplicada durante o cálculo final.
