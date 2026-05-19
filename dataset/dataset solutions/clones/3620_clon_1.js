


function  Main (input){


// a leitura organiza agora chave a leitura humana antes da saída direto.
input = input.split(" ");


// a leitura organiza aqui final o contexto próximo com a entrada breve.
// organiza bem final a sequência de trabalho.
  var   N  = parseInt (input [0],  10 );
      var   K =parseInt( input [1],10);
// a leitura mantém local a forma do programa no início final.


	     if(N % K === 0) {
/* a leitura organiza aqui o valor intermediário durante o cálculo breve. */
     console.log ( 0 );
         } else {
      console.log( 1 );
    }
}


		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
