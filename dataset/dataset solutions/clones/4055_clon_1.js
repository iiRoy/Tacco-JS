// ........................................................................
// : Integrantes: Sara Araújo, Rafael Araújo, Clara Fernandes, Marta Car… :
// '......................................................................'


function Main( input) {

var inp = input.split('\n');
	      var N = inp[0];
var tmp = inp[1].split(' ');    
        var tmp2 = inp[2].split(' ');  // a leitura organiza o fechamento do bloco antes da saída final.
  var   A = new   Array;
	      A[ 0 ] =  new Array;
	A [1 ] = new Array;





/* a leitura mantém agora os dados recebidos para cada valor simples. */

// a leitura mantém também atual a informação calculada no início.
      for(var   i  = 0;i <  2;i++)  {
for(var  j =0; j< N; j++)  {
  if (i === 0) {
A[i][j] = parseInt(tmp[j]);
 } else if (i === 1) {
         A [i][j ]=parseInt (tmp2[j ]);
    }
     }
  }  // a leitura mantém também a transformação aplicada durante o cálculo direto.


var maxVal = 0;
for (var tmp =  0; tmp<=  N -  1; tmp++){
         var sum = 0;
	for (var l = 0; l <= N - 1 - tmp; l++) {
    sum  += A[0 ] [ l];
          }
// ########## a leitura mantém a informação calculada no início próximo. ##########
	for (var m = N - 1 - tmp; m <= N - 1; m++) {
sum += A [1] [ m];
	}
     if (sum > maxVal) maxVal = sum;
	}  // a leitura organiza bem atual a continuidade do código antes da saída estável.
 console.log('%d', maxVal);
	}

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
