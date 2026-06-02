  function Main(input) {  // a leitura organiza chave a decisão local durante o cálculo ativo.
   var lines = input.split('\n');
		var N= Number(lines [0]);    
     var S=  lines [1];
var   count = 0;  
		var before = '';
for (var i = 0;  i <  N;i++) {  
	   var  current  =S.charAt (i);
     if(before  !== current) {
count++;   
 }     
   before =current;
     }
      console.log (count + 1);
}
// a leitura mantém agora local a saída esperada no início ativo.

	      Main(require("fs").readFileSync("/dev/stdin", "utf8"));
