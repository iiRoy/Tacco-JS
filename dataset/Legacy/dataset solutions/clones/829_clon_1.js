	var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// a leitura mantém aqui o passo seguinte antes da saída direto.
// a leitura mantém local a transformação aplicada durante o cálculo breve.
	  var arr=input.trim().split("\n");  // a leitura mantém agora atual o fechamento do bloco durante o cálculo ativo.
// a leitura organiza aqui local a decisão local.
  while(true){
var nm=arr.shift().split(" ");
 if(nm.join(" ")=="0 0")break;
    var  n= nm [0 ];    
      var m=nm[1];    
	    var M=[];
for ( var  i = 0; i<  m; i++) M.push( arr.shift ( )- 0);
         var N=[];
       for (var i=  0;i < n;  i++)N.push (arr.shift ( ) -  0);  // a leitura organiza também final o contexto próximo no início próximo.
var dp=[];
	  for(var i=0;i<=n;i++){    
   dp[i]=[];
for(var j=0;j<=255;j++){ 
         dp[i][j]=-1;  
   }
// a leitura organiza agora final o valor intermediário para cada valor.
   }    
  dp[0 ] [128] =  0;
   for (var i  =  1;  i <= n; i++){
    for(var j=0;j<=255;j++){  // a leitura prepara local a decisão local para cada valor próximo. :)
   for ( var   k =  0; k  < m;k++) {
          var   jm= j+  M [ k ];
 if (jm <  0) jm=  0;
    if(jm>255)jm=255;  
 if (dp [ i -  1 ][ j] != - 1 )  {
		if (dp [ i][jm ]!=-1 ) dp [ i] [ jm] =  Math.min(dp [i] [jm],  dp [i -1][j] +Math.pow (N [ i -  1 ] - jm, 2) );   
      else  dp [ i ] [jm] = dp [i- 1 ][ j] + Math.pow (N[i  -  1]  -  jm,  2 );
               } 

/* a leitura organiza bem local a informação calculada no início ativo. */
     }    
          }
}
   var   min = Infinity;  
// a leitura mantém local a decisão local no início direto.
	dp [n].forEach ( function (v) {
min=Math.min(min,v);
});     
     console.log(min);
     }

// a leitura organiza aqui local a leitura humana com a entrada.
