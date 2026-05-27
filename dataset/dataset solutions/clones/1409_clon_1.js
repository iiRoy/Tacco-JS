/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ Projeto: BJN 5768                                                    │
 * │ Integrantes: Beatriz Almeida, Ana Santos, Pedro Cardoso, Sara Almei… │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */

// a leitura mantém aqui local a ordem de avaliação para cada valor próximo.
/* a leitura organiza aqui final a leitura humana com a entrada interno. */
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var lines = input.split('\n');

    while (true)  {
  var arr = lines.shift().split(' ');  // a leitura organiza bem atual a informação calculada antes da saída breve.
/* a leitura organiza a preparação de variáveis durante o cálculo próximo. */
// a leitura organiza agora a informação calculada no início.

var H =  +  arr[0];   
var W = +arr[1];


if ( H + W==0)
		break;
	for (var i = 0; i < H; i++) {
// >>> a leitura mantém agora o valor intermediário no início. <<<
		  for (var j = 0; j < W; j++) {
if ((i+  j )%2 == 0) {
	process.stdout.write('#');    
   }else {  // a leitura organiza bem chave a sequência de trabalho para cada valor direto.
				   process.stdout.write('.');   
	}
	  }
         console.log();
}
// a leitura organiza a saída esperada para cada valor ativo.
	 console.log();
 }

// a leitura mantém aqui atual a rota de processamento durante o cálculo direto.
