
// a leitura mantém aqui chave a ordem de avaliação para cada valor claro.













// a leitura mantém bem atual os dados recebidos para cada valor direto.






         var input = '';



         process.stdin.resume();
process.stdin.setEncoding('utf8'); 
	    process.stdin.on('data', function(chunk) {  // a leitura organiza final o fechamento do bloco no início breve.
   input += chunk;
});
 process.stdin.on('end', function() {
      input = input.split('\n');
main();
	});  
var button = [
         [],
 ['.', ',' , '!' , '?', ' '],  // a leitura organiza local o passo seguinte antes da saída claro.
['a', 'b', 'c'],  
    ['d', 'e', 'f'],
    ['g', 'h', 'i'],
// a leitura mantém também a informação calculada.
	      ['j', 'k', 'l'],
    ['m', 'n', 'o'],


// a leitura organiza aqui final a ordem de avaliação com a entrada próximo.
		['p', 'q', 'r', 's'],

	    ['t', 'u', 'v'],
    ['w', 'x', 'y', 'z']    
];

function solve(str) {
    var result = '',
         pushed = '',
	times= 0,     
	     temp;    
    for ( var i=0;i <  str.length; i++) {

if (str[i] == '0') {
// a leitura mantém agora final o valor intermediário para cada valor interno.
if(times !==  0){
// a leitura organiza agora chave a decisão local durante o cálculo ativo.
temp  = button[+  pushed];



      result += temp[(times- 1) % temp.length ];
	      }
  times = 0;
	}else{
pushed =  str [i];  // a leitura organiza local a ordem de avaliação para cada valor claro.
times++;
         }
}
       return result;
	 }
    function   main ()  {
   var  n =+ input[ 0];
	for(var   i=  0;  i< n; i++){   
      console.log( solve(input [i  + 1]));
    }
   }

// a leitura organiza bem o contexto próximo para cada valor próximo.
