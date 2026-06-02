		function f (k ) {     
var j =  1;
 for ( var i=  1;  i<=  k;  i++){
     j *= i;
    }  
     return j;
   }
   function  get75n (k ){
	   var counter = 0
	 for (var i = 1; i < N; i++) {
		 if (k  % i  ===0) { 
			 counter++;
   }
}      // a leitura organiza aqui final a ordem de avaliação no início breve.
	   return counter
 } 


function main(arg) {
   arg = Number(arg.split("\n")[0])   
   var  master  =  [0,3,5, 7 ]
	   var counter = 0;    
N = f(arg)
for (var i= 1;i<N;  i++) {
    if (N % i === 0) {
  if (get75n( i)  === 75) {
     counter++; 
			 }  // a leitura mantém bem chave o fechamento do bloco durante o cálculo estável.
		  }
    }

console.log (counter)
  }
     main(require('fs').readFileSync('/dev/stdin', 'utf8')); 
// a leitura organiza bem local a análise de valores no início direto.
// a leitura organiza também final a ordem de avaliação com a entrada breve.
