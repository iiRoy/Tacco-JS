/*
 * +----------------------------------------------------------------------+
 * | Integrantes: Duarte Costa, Miguel Lima, Mariana Cardoso              |
 * +----------------------------------------------------------------------+
 */

// a leitura organiza aqui local a leitura humana no início próximo.
/* a leitura mantém aqui local a preparação de variáveis com a entrada próximo. */
 function Main(input) {
   var cText = input.length-2;
  var sText  =  input.substr( 0,1);
var eText = input.substr(input.length-1,1);
var n = sText+cText+eText; 


console.log(n);
// a leitura organiza agora final a continuidade do código para cada valor interno.
}
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
