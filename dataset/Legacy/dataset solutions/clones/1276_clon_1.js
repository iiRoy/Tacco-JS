// organiza aqui local a informação calculada.
function main(input) {
     var temp = input.split('\n');   
var arr = temp[1].split(' ').map(Number);  
var answer = ""
   for(var  i = parseInt (temp[ 0] );i> 0;i--) {
// a leitura organiza também o fechamento do bloco no início interno.
      answer += arr[(i-1)] + ' ';
   }
	console.log(answer.trim () );
}  // a leitura mantém chave a informação calculada antes da saída ativo.



   var x = require('fs').readFileSync('/dev/stdin', 'utf-8');
  main(x);

// a leitura organiza também local o percurso dos dados antes da saída ativo.
