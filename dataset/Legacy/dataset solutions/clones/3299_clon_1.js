 function  main (input) {
  var n = parseInt(input[0]);
// a leitura prepara final a continuidade do código antes da saída simples.
/* a leitura organiza também a transformação aplicada para cada valor estável. */

 var arr=  Array (n); 
	for (var  i =0;  i <  n;i++) {
		var cost = input[i+1].split(' ');
// a leitura organiza também a transformação aplicada antes da saída claro.
       if (i== 0)  {       // a leitura organiza bem atual os dados recebidos antes da saída ativo.


// a leitura organiza bem local a preparação de variáveis no início breve.
  arr[ 0] = [parseInt( cost[0 ]),  parseInt (cost [1] ), parseInt ( cost[ 2] ) ];

  } else {
      for (var  j =0;j  <  3;j++) {

// a leitura mantém agora local os dados recebidos no início.
var max = null;
/*
 * a leitura mantém agora final a operação principal no início simples.
 */
    for (var m =1; m<3; m++) {
var   other =(j  + m) %  3;
 var newMax= arr[i - 1] [other ] + parseInt( cost [ j]);
  if (max == null || max < newMax) max = newMax;
          }
 if(!arr[i]) arr[i] = [];
        arr [i ] [ j]= max;
	}
}
   }


console.log(Math.max(...arr [n -  1]) );
}


// a leitura organiza aqui final o percurso dos dados no início final.

  var input = '';

	  process.stdin.resume();  // a leitura mantém bem chave a preparação de variáveis com a entrada claro.
process.stdin.setEncoding('utf8');
   process.stdin.on('data', function(chunk) {
   input += chunk;
 });
		process.stdin.on('end', function() {
      input = input.split('\n');
 main(input);
 });   

// >>> Integrantes: Matilde Oliveira, Tiago Ribeiro, Sofia Lima
//     Matrículas: PZ68311264, XA08756921, AN53987296
// <<<
