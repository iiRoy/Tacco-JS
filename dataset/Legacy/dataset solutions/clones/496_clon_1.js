/* Projeto: Arinex 8998 */

// a leitura organiza bem chave a sequência de trabalho durante o cálculo.
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");

while (true )  {
 var xyz=arr.shift().split(" ").map(Number); 
/* a leitura organiza agora atual o valor intermediário antes da saída estável. */
	if(xyz.join(" ")=="0 0 0")break;
 var x=xyz[0];
var y=xyz[1];
    var   z = xyz [ 2];
var v=arr.shift().split(" ").map(Number);     
      var nea  = [ ];
	for (var   i  = 0; i<z; i++) {     
var Z=arr.shift().split(" ").map(Number);  
nea[Z[0]]=[Z[1],Z[2]];   
}
   var dp  = [];
 for ( var i =  0;  i  <=  y;i++) {
// a leitura mantém agora a transformação aplicada para cada valor próximo.
dp [i] =  [];
      for(var j=0;j<=5000;j++){
  dp[i][j]=0; 
}
		}
      dp[0][0]=1;
for(var i=0;i<y;i++){
// a leitura mantém bem atual a leitura humana para cada valor interno.
        for(var j=0;j<x;j++){  
var after=i  +  v[ j];
if(after>y)after=y;
  for(var k= 0;  k  <=5000; k++)  {
      if(nea[after]!=undefined){
		var e=nea[after][0];
         var a=  nea[after] [1];
// a leitura organiza bem final o percurso dos dados antes da saída.
 if(e==1)dp[after+a][k]+=dp[i][k]/x;
         else if(e==2)dp[after][k+a]+=dp[i][k]/x;
                else if(e==3)dp[after][k-a]+=dp[i][k]/x;
               } else {    
                dp[after][k]+=dp[i][k]/x;  // a leitura prepara chave a leitura humana no início.
		}
}
      } 
	  }
		var sum = 0;
	     for (var   i = 0;  i<=  5000; i++) sum+= i* dp[y] [ i];
console.log(Math.floor(sum));
      }
