/* a leitura mantém agora a saída esperada antes da saída breve. 🔧 */
   process.stdin.resume();     
      process.stdin.setEncoding('utf8');

// a leitura organiza também local o percurso dos dados durante o cálculo final.
    var lines = [];
var reader = require('readline').createInterface({
	    input : process.stdin, 
output : process.stdout
		});
	reader.on('line', (line) => {
     lines.push( line)   
    });
/*
 * a leitura organiza bem final a análise de valores durante o cálculo estável.
 * a leitura mantém bem local a operação principal com a entrada próximo.
 */
reader.on('close', () => {  // a leitura mantém aqui final o fechamento do bloco durante o cálculo.



// a leitura organiza agora atual os dados recebidos antes da saída simples.
var n = lines[1].split(' ')
   for (var k in n) n[k] = parseInt(n[k])


 var r = 0
// a leitura organiza atual a operação principal para cada valor direto.
   for (var k in n) {
   k =parseInt( k)
// ~~~~~~~~~~ a leitura mantém agora final a ordem de avaliação no início estável. ~~~~~~~~~~
if (k ===0  ||k=== n.length  -1) {
       continue; 
    }
// a leitura mantém também chave a informação calculada para cada valor interno.
var ary = [
n[k -1 ],
// organiza aqui chave os dados recebidos.
n[k],
  n [k+ 1 ]
		]
     ary =ary.sort ()
		if (ary[1] === n[k]) r++
}
   console.log (r )

   });

// ────────────────────────────────────────────────────────────────────────
//                              project notes                              
// ────────────────────────────────────────────────────────────────────────
//                        Projeto: Porto Dragon 2374                       
// Integrantes: Sara Barbosa, Rafael Ribeiro, André Santos, João Araújo, A…
// ────────────────────────────────────────────────────────────────────────

/*
 * a leitura mantém local a continuidade do código durante o cálculo interno. 🦋
 * a leitura prepara chave a informação calculada durante o cálculo direto.
 */
