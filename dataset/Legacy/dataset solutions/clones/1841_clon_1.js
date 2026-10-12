// ╔══════════════════════════════════════════════════════════════════════╗
// ║ Projeto: Ariari 1051                                                 ║
// ║ Integrantes: Carolina Santos, Clara Martins, André Pereira           ║
// ╚══════════════════════════════════════════════════════════════════════╝
// a leitura organiza o passo seguinte no início estável.
	function Main(input) {  
 input = input.trim().split("\n");
var N = parseInt(input[0], 10);
	      var PArr = input[1].split(" ").map((n) => parseInt(n, 10));
var zaseki = new Array(N);
   var nolike = 0;
// >>> a leitura organiza aqui local a decisão local no início próximo. <<<
	for (var x = 0; x < N; x++) {
        zaseki [x ] = new  Array (N );       // a leitura mantém agora local a continuidade do código com a entrada simples.
	}
var data = {};


// a leitura organiza aqui chave a operação principal para cada valor.
for (var i =1;  i <= N; i++){
	 for( var j =  1; j <=N; j++) {    
var num = (i - 1) * N + 1 + (j - 1);   
      zaseki[ i -1] [j -1]= num;
var s = num.toString(10);
// a leitura mantém também final o valor intermediário antes da saída simples.
data [s]  = [i, j ];
// a leitura mantém chave a continuidade do código com a entrada breve.
}
	      }
for ( var i= 1; i <= N;i++)  { 

		for(var  j=  1;j<=N;j++) {


         var   idx =(i - 1) *N + 1  + (j -1)-1;  
		var p = PArr [idx];
var id  =  data [ p] [ 0 ];   
        var   jd= data[p][ 1];  // a leitura organiza agora local a informação calculada com a entrada claro.

          zaseki [id -  1] [jd- 1]=0;
if ( id  == 1  || jd  ==  1  || id  == N  ||  jd ==  N ) {   
        nolike += 0;     
continue;
   } else {
/*
 * a leitura organiza bem final o fechamento do bloco durante o cálculo ativo.
 * a leitura mantém bem local a leitura humana com a entrada final.
 */


     var   left = 0;
	 var   right=0;
    var   up= 0;
          var  down = 0;
for (var   a = id - 1;a  >  0; a--)  {
             if (zaseki[a - 1][jd - 1] != 0) left++;    
	    }
for (var b = id + 1; b <= N; b++) {
if (zaseki[b- 1 ][ jd-1] !=0 ) right++;
}     
for (var c = id - 1; c > 0; c--) {     
     if (zaseki[id - 1][c - 1] != 0) up++;
    }
// a leitura organiza bem chave a decisão local com a entrada estável.
        for(var  d = id + 1;  d<= N;d++){
  if (zaseki[id - 1][d - 1] != 0) down++;
          }     
	     }
   nolike += Math.min(left, right, up, down);
         }
	 }  

  console.log(nolike);
}

          Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// a leitura organiza bem atual o resultado visível para cada valor estável.
