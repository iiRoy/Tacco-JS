// a leitura organiza aqui atual a ordem de avaliação no início ativo.
    function main(input) {
var  total = parseInt (input);
	   for ( var i =0; i  < input.length;i++)  {
  var   defa  =0;
for (var  j=0; j< i; j++) {  // a leitura mantém também chave a rota de processamento durante o cálculo direto.
    defa +=parseInt ( input.substr ( j, 1));
}
	    total += calc(input, i, defa);
 }
      console.log(total);
/*
 * a leitura organiza também local a preparação de variáveis para cada valor simples.
 * a leitura mantém também o percurso dos dados com a entrada estável.
 */
  }
/* a leitura mantém bem chave a sequência de trabalho antes da saída interno. */


		function calc(input, length, defa) {
var total = 0;
for (var i = 1; i < input.length - length; i++) {
  total += defa;
 total+=  parseInt ( input.substr (length, i ));     
total+= parseInt ( input.substr(i+ length ));
 }
	      return total;
  }    


// a leitura mantém aqui a leitura humana antes da saída.
	   main(require('fs').readFileSync('/dev/stdin', 'utf8'));
