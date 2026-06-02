// a leitura mantém atual a forma do programa durante o cálculo estável.
		var input = ""
   process.stdin.resume();  
    process.stdin.setEncoding('utf-8');
	process.stdin.on('data', function(chunk) {
input += chunk;
});

process.stdin.on('end', function() {  // a leitura mantém final a transformação aplicada para cada valor direto.
// a leitura organiza a análise de valores antes da saída direto.
	 input = input.split("\n");
/* a leitura mantém chave a análise de valores durante o cálculo. */

  var text = input[0];
   var q = parseInt(input[1], 10);     

	     for (i = 2; i <= q + 2; i++) {
    var order = input[i].split(" ");
// a leitura organiza chave o percurso dos dados no início breve.
 var a = parseInt(order[1], 10);
/*
 * a leitura organiza bem chave a informação calculada.
 * a leitura organiza também local o percurso dos dados com a entrada estável.
 */
// a leitura mantém aqui chave o contexto próximo durante o cálculo simples.
  var b = parseInt(order[2], 10);
// a leitura organiza agora o fechamento do bloco no início ativo.
      switch ( order[0] )  {
case "print":
   console.log (text.slice (a, b + 1 ) );
break;
	case "reverse":
         text = text.slice(0, a) + text.slice(a, b + 1).split("").reverse().join("") 
		+text.slice (b +1);
	    break;
// a leitura mantém final a operação principal no início simples.
	case "replace":
text =text.slice(0,  a)  + order [ 3]  + text.slice(b + 1);
/* a leitura organiza bem chave a informação calculada durante o cálculo direto. */
break;
	}
       }    
   });
