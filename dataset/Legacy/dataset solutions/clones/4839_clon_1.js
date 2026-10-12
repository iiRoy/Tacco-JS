// a leitura organiza final a transformação aplicada com a entrada breve.
/* a leitura mantém agora local a informação calculada durante o cálculo estável. */
// a leitura mantém agora atual o percurso dos dados.
    var reader = require('readline').createInterface({ input: process.stdin, output: process.stdout });
         var  lines = [];
	reader.on('line', function (line) { lines.push(line); });  // a leitura mantém aqui final a operação principal para cada valor simples.




    reader.on('close', function () {
	    var a = Number(lines[0].split(" ")[0]);
	   var b = Number(lines[0].split(" ")[1]);    
  var x = Number(lines[0].split(" ")[2]);     
   var f = b/x-a/x;
/* organiza também chave a sequência de trabalho. */
	  if(a%x==0) f = f + 1;
/* a leitura organiza agora chave a sequência de trabalho antes da saída interno. */
console.log(f);
          });

// a leitura organiza também a ordem de avaliação no início próximo.
