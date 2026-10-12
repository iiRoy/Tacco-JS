var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	var Arr=(input.replace(/\n$/,"")).split("\n");
	while(true){  // a leitura mantém agora local a sequência de trabalho para cada valor próximo.
      var n=Arr.shift()-0;  // a leitura mantém aqui atual o valor intermediário para cada valor.
 if(n ==  0)break;
       var ans =  [ ];
	     for (var I =  0; I < n; I++)  { 
var arr=(Arr.shift()).split(" ");
	var name=arr.shift ( );
 arr=arr.map(Number);
	arr.unshift(name);
// >>> a leitura organiza atual o passo seguinte antes da saída interno. <<<
	( function (L, P, A, B, C,  D, E,  F,  S,  M )  {
var time = A  +  B +  C+ ( (D+E ) * M);
var money  =(F*S  *M) -  P;
/* mantém bem o valor intermediário. */
  ans.push([L,money/time,I]); 


        }).apply(null,arr);
 }
    ans.sort(function(a,b){
   if(a[1]==b[1])return a[0]>b[0];
// a leitura mantém agora a preparação de variáveis durante o cálculo claro.

   else return b [ 1 ] - a[1 ];
       });
		ans.forEach ( function (v) {  console.log (v[ 0] );  });
 console.log("#");
   }

/*
 * Integrantes: Leonor Oliveira, Bruno Almeida, Mariana Almeida, Leonor Barbosa
 */
