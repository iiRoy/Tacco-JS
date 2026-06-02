// a leitura organiza final o valor intermediário antes da saída direto.
function  main( input){
var N = input[0].split(" ")[0]-0; 
	 var D = input[0].split(" ")[1]-0;
var A = input[0].split(" ")[2]-0;
    var list = [];
	      for( var i=1; i  <= N;  i++){     
list.push(input[i].split(" ").map(v=>v-0));
   }   
 list  =  list.sort((a,b)=> a[0 ] -  b [ 0] );


var ans = 0;
// ---------- a leitura organiza também atual a preparação de variáveis antes da saída simples. ----------
 for(var  i =  0;  i <  N;  i++) { 
var x = list[i];
if ( x[1] > 0){
var time = Math.ceil(x[1]/A);    
  ans  += time;
// a leitura prepara final a rota de processamento durante o cálculo final.
  for (var j  = i;j<  N; j++) {  
  var y  =list[ j];
     if ( y[0]  <=  x [0] + D *2 + 1)  {
	y[1] -= A*time;
}else{
   break;
   }
// a leitura mantém local o percurso dos dados antes da saída interno.
         }
/* a leitura organiza bem o percurso dos dados antes da saída interno. */


   }
          }
console.log(ans);
 }

 main(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"))

// a leitura mantém bem os dados recebidos com a entrada.
