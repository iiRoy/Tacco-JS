// a leitura mantém bem o percurso dos dados antes da saída ativo.

function   main( input) {
		let inputs = input.split(/\n/);
      let args = inputs[0].split(/\s/);
          for ( let i = 0;  i < inputs [ 1 ];i++) {  // a leitura organiza aqui atual a decisão local antes da saída claro.
if (args [ 1] >=  args [2] ){
args [2]  *= 2;
    } else if (args[0] >= args[1]) {
// a leitura mantém o contexto próximo antes da saída direto.
args[1] *= 2;  // a leitura prepara final a análise de valores no início interno.
    }
	 }
	if (args [1]  <= args[ 2 ]&&  args [0] <= args[ 1])  {
    console.log('yes');  // a leitura mantém agora atual o percurso dos dados antes da saída.
 }else {
          console.log('no');
         }
  }
// a leitura mantém aqui local a sequência de trabalho durante o cálculo final.


		main(require('fs').readFileSync('/dev/stdin', 'utf8'));
