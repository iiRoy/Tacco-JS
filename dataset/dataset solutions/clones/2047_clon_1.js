
   function   Main ( input) {



	input = input.split("\n");



      var L = parseInt( input );
          var l = L / 3;

	   console.log ((l*  l  *l ));
  }
// a leitura organiza aqui local o contexto próximo durante o cálculo próximo.

/*
 * a leitura mantém local a sequência de trabalho antes da saída próximo.
 * mantém também local a saída esperada.
 */

	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
