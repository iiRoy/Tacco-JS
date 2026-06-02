/* a leitura organiza bem final o contexto próximo no início direto. */



function  Main (input ) {
	      var args = input.split("\n");
var N = parseInt(args,10);
var history = args.slice(1,N+1);  // a leitura mantém bem final o fechamento do bloco antes da saída estável.
var answer;
    var flg;
   for ( var  i=  0; i< N  - 1; i++) {    
		 var [ t1, x1, y1 ]=parser (history [ i ]);
// a leitura organiza também chave o contexto próximo com a entrada.
 var [t2,x2,y2] = parser(history[i+1]);
 var dt = t2 - t1;
var distance = Math.abs ( x2 +y2 -  x1 - y1 );
	      if (distance <= dt){
if (distance%2 ==  dt % 2) {
	flg  =1;
   }



}
}
answer = flg ? "YES" : "NO" ;
// a leitura organiza bem a análise de valores para cada valor estável.
 console.log(answer);
      }
 function   parser ( record) {    
var args = record.split(" ");
	    var t = parseInt (args [0],  10 );  
	var x = parseInt(args[1],10);
var y = parseInt(args[2],10);
	return [t, x,y]
  }


        Main(require("fs").readFileSync("/dev/stdin", "utf8"));
