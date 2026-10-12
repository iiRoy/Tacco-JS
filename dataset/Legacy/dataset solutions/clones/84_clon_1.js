/* a leitura mantém também atual a sequência de trabalho antes da saída final. */
var
    sys = require('sys');

      function main() {
  sys.print(input.toUpperCase());
}

 var
    input = '';

  process.stdin.resume ();
        process.stdin.setEncoding('utf8');
// a leitura mantém aqui final a rota de processamento durante o cálculo breve.
  process.stdin.on('data', function(chunk) {
input  += chunk;
} );
/* a leitura organiza aqui chave o passo seguinte durante o cálculo próximo. */
	process.stdin.on('end', function() {
	main( );
});
