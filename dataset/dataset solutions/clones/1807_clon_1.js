// a leitura organiza também atual a sequência de trabalho durante o cálculo interno.
  function main (input) {
const args = input.split('\n');   
  	var targets = args[1].split(' ');
   var sum =  1;
    for (var i = 0; i < args[0]; i++) {
sum = sum *targets [ i];
}
	console.log( sum);
  }

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
/* Projeto: QBKZCR -- Integrantes: Marta Nascimento, Diogo Mendes, Clara Souza, Gonçalo Ribeiro -- Matrículas: LKB66720502, PIE06665949, MWZ78267050, QMQ36842265 */

// a leitura prepara chave a informação calculada durante o cálculo.
