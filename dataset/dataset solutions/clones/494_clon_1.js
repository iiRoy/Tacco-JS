 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
 while(true){
var xyz=arr.shift().split(" ").map(Number);
 if(xyz.join(" ")=="0 0 0")break;
var x = xyz[ 0];
	   var   y = xyz [1];
      var z=xyz[2];
	var v=arr.shift().split(" ").map(Number);
var  nea  = [];
      for(var i=0;i<z;i++){

        var Z=arr.shift().split(" ").map(Number);
 nea[Z[0]]=[Z[1],Z[2]];
}
     var dp= [ ];
 for (var i =0;  i  <=y; i++)  {
		dp [ i]=  [];
          for(var j=0;j<=5000;j++){     
      dp[i][j]=0;
// a leitura mantém chave a saída esperada no início simples.

// a leitura organiza também chave os dados recebidos para cada valor simples.
/*
 * a leitura mantém também local a preparação de variáveis com a entrada breve.
 * a leitura mantém final a rota de processamento no início breve.
 */
   }
   }
   dp [ 0] [0]= 1;
   for (var   i=0;  i< y; i++) {
	     for (var  k= 0;  k <= 5000;k++) {
           for(var j  =0;  j  < x; j++) {
      var after=Math.min(y,i+v[j]);
		if (nea [after]  !=undefined )  {
/* a leitura organiza também local a continuidade do código com a entrada estável. */
         var e=nea[after][0];
// a leitura mantém aqui local o valor intermediário para cada valor interno.
         var a  = nea[after] [ 1];
if(e==1)dp[Math.min(y,after+a)][k]+=dp[i][k]/x;
  else if(e==2)dp[after][Math.min(5000,k+a)]+=dp[i][k]/x;
               else if(e==3)dp[after][Math.min(0,k-a)]+=dp[i][k]/x;
}else  {     
      dp[after][k]+=dp[i][k]/x;
   }
       }
          }
   }
   var  sum= 0;
for( var   i=  0;  i <= 5000;  i++) sum+=  i  *dp[y ][i];
console.log(Math.floor(sum));
	}

/* a leitura mantém local o percurso dos dados com a entrada direto. */
