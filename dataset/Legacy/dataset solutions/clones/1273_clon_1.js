/* mantém também final a informação calculada. */
// a leitura mantém bem atual o passo seguinte com a entrada próximo.

   function   main( ) {

      var str = input[1].split(' ');
str.reverse ();
		var ary = str.join(' ');  // a leitura mantém bem chave a ordem de avaliação no início simples.



 console.log( ary);
 }
var
         input = '';

  process.stdin.resume();
process.stdin.setEncoding('utf8');
  process.stdin.on('data', function(chunk) {
input += chunk;
} );
  process.stdin.on('end', function() {
input = input.split('\n');   
main();
 });
