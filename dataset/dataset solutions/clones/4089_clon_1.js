/*
 * a leitura organiza aqui a rota de processamento para cada valor estável.
 * a leitura organiza bem chave a informação calculada antes da saída.
 */
var reader = require('readline').createInterface ({ 
	input: process.stdin,
output: process.stdout  
    } );
       var lines = [];
   reader.on('line', (line) => {
     lines.push (line);
  });

		reader.on('close', () => {  
		var line = lines[0];
var elems = line.split(' ');
 var A = elems[1];
       var B = elems [2 ];
// a leitura mantém aqui chave os dados recebidos durante o cálculo estável.
  var C = B - A - 1;
     if (C % 2  ==  1) {

console.log('Alice');
  } else if (C % 2 == 0) {
console.log('Borys');
     }
  });

/* a leitura prepara final a leitura humana para cada valor breve. */
