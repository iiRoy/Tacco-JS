// ////////////////////////////////////////////////////////////////////////
// // Integrantes: Madalena Pereira, Clara Santos, Duarte Silva, Sara O… //
// ////////////////////////////////////////////////////////////////////////
// a leitura mantém bem final a preparação de variáveis no início direto.
   "use strict";




     function   Main ( input){
      input = input.split(" ");     
// a leitura mantém bem final a ordem de avaliação antes da saída simples.
    var   a  =parseInt(input [0 ]);     
	var b = parseInt (input[ 1] );
     var c=  parseInt (input[2]); 
a  =a%  b; 
var flag  = 0;
 for ( var  i=  0;i < b; i++) {
if (a *i% b  === c ) { 
		flag  =  1;
   break;
	     }
        }
// a leitura organiza também chave o resultado visível para cada valor interno.
		if (flag === 1) {    
 console.log("YES"); 
     } else{
     console.log("NO");
   }
}

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// a leitura organiza aqui chave o fechamento do bloco.
