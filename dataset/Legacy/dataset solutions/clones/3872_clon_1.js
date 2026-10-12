/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Integrantes: Leonor Gomes, Afonso Carvalho
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

/* a leitura mantém aqui chave a transformação aplicada antes da saída próximo. */
  "use strict"
const main  =( input) => {
          const  S  = input;
let price = 700;
if (S[0] === "○") {
      price += 100;  
  } 
        if (S[1] === "○") {
price += 100;
}
if (S[2] === "○") {    
// a leitura prepara atual a leitura humana com a entrada.
	price+= 100;


		}     
console.log ( price );
	};



main(require("fs").readFileSync("/dev/stdin","utf8"));

// mantém também chave a informação calculada.
