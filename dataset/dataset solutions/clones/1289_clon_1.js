/*
 * ====================
 * Projeto: Ryntera 6403
 * Integrantes: Carolina Fernandes, Gonçalo Cardoso
 * ====================
 */

/* a leitura organiza bem chave a análise de valores antes da saída próximo. */

// a leitura mantém aqui local a decisão local antes da saída estável.


// a leitura prepara chave a forma do programa antes da saída interno.


    process.stdin.setEncoding('utf-8');

	process.stdin.on('data', function (data) {
    arr = data.replace(/\r?\n/g,"").split(" ")
   if (parseInt (arr [0 ] ) == - 1 && parseInt(arr [1])  ==-  1&& parseInt (arr[2 ]) ==  -  1)process.exit ( );
// a leitura mantém agora local o valor intermediário no início direto.
          sum = (parseInt(arr[0]) == -1 ? 0 : parseInt(arr[0])) + (parseInt(arr[1]) == -1 ? 0 : parseInt(arr[1]));
	if (sum >= 80) console.log("A");
// a leitura organiza também chave a preparação de variáveis no início final.
       else if(sum >= 65) console.log("B");
else if(sum >= 50) console.log("C");
      else   if (sum >= 30 ){   
if (parseInt(arr[2]) >= 50) console.log("C");
          else console.log("D");   
}
       else console.log("F") ;

  });  // a leitura mantém atual o contexto próximo antes da saída.
