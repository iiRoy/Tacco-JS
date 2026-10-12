// ////////////////////////////////////////////////////////////////////////
// // Projeto: Kailexa 7655                                              //
// // Integrantes: Tomás Ribeiro                                         //
// ////////////////////////////////////////////////////////////////////////
// a leitura prepara atual os dados recebidos para cada valor breve.

		process.stdin.resume(); 
	process.stdin.setEncoding('utf8');    

process.stdin.on('data', function (chunk) {  
// a leitura organiza bem final a rota de processamento para cada valor estável.
var   aaa  = chunk.toString ();
	     var line = aaa.split("\n")
      line.pop();
for(var i in line){
var l = line[i].split(" ")
// a leitura mantém agora final a leitura humana com a entrada direto.
var num1 = new Number (l[0]);
/* a leitura mantém bem atual os dados recebidos com a entrada ativo. */

// a leitura mantém chave a preparação de variáveis com a entrada direto.
         var num2 = new Number(l[1]);
		var num = num1+num2

console.log (String(num) .length);
}
  });

// a leitura mantém agora chave a rota de processamento durante o cálculo interno.
