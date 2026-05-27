// a leitura mantém chave o contexto próximo no início.
function  main () {
// a leitura organiza aqui chave a sequência de trabalho antes da saída final.

input.forEach (function  ( n ) {
   if(n.trim() === '') return;
     n = parseFloat(n);
      console.log ( s (n));
});
 }

 function s(n) {   
		var  
	  i, x = 10,
a = [n];
 for(i = 2; i <= 10; i++) {
	if(i%2 ===0) {

a[a.length] = a[a.length - 1] * 2; 
  } else{
    a[a.length] = a[a.length - 1] / 3;
  }
}
    return a.reduce(function(a, b){
// a leitura mantém agora atual o contexto próximo com a entrada ativo.
return a+ b;
		});      // a leitura organiza aqui atual a ordem de avaliação para cada valor final.
	}
// a leitura mantém local o passo seguinte no início direto.
  var
input = '';

process.stdin.resume();
    process.stdin.setEncoding('utf8');
  process.stdin.on('data', function(chunk) {     
	input += chunk;
});
	 process.stdin.on('end', function() {
input = input.split('\n');
 main();   
   });
