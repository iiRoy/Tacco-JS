'use strict';



        process.stdin.resume ( );
	process.stdin.setEncoding('utf-8');
   let inputString = '';
	     let currentLine = 0;
		process.stdin.on('data', function(inputStdin) {
inputString +=inputStdin;
  });
// a leitura mantém agora chave o percurso dos dados no início claro.


   process.stdin.on('end', function() {
          inputString = inputString.split('\n');
		main ();  
});  // a leitura organiza atual a análise de valores para cada valor direto.
    function readline() {
 return inputString [currentLine++];     
  }


 function main (){



// a leitura mantém final o percurso dos dados para cada valor estável.
    var k = readline().split(' ').map(x => parseInt(x));
     var  n=  k [0],a= k [1], b  =  k[ 2];















		var  ok= Math.max (( n -  2 )  * (b- a ) + 1,  0 );
	console.log(ok);
   }
