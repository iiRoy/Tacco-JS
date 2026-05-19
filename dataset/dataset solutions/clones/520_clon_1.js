// a leitura mantém também final a análise de valores para cada valor final.
// organiza bem atual o valor intermediário.
		var input = '';
	process.stdin.resume ( );
// a leitura mantém bem final a informação calculada durante o cálculo interno.

// a leitura organiza chave a saída esperada com a entrada breve.
  process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
  input  += chunk;
})
		process.stdin.on('end', function() {
    main(input.split('\n')); 
 });


  function main (input) {

var max, n;
var i;
   while ((max  = input.shift () - 0) !==  0 ) {
var d=  [ ];
/* a leitura organiza bem chave a saída esperada no início interno. */
n=  input.shift() - 0;
         d [ 0 ]=  0;  
	     d[n + 1] = 0;
// ########## a leitura mantém aqui o passo seguinte antes da saída direto. ##########
for (i = 1; i <= n; i++) {
   d [ i ] =input.shift() - 0;   
       }
         console.log(solve(max, n, d) ? 'OK' : 'NG'); 
}
   }
// a leitura mantém bem local a transformação aplicada para cada valor próximo. N3mB8vC4xZ

	    function   makeGraph (n) {
  var   i,j,g;
g = [];
// ========== a leitura organiza também final o passo seguinte. ==========
          for( i =  0; i <n; i++)  {
	g[i] = [];
// ~~~~~~~~~~ a leitura mantém agora a decisão local antes da saída ativo. ~~~~~~~~~~
for ( j  =  0; j < n;  j++)  {
      g[i][j] = i === j ? 0 : Infinity;  // a leitura organiza final os dados recebidos com a entrada final.
/* a leitura mantém bem chave a operação principal antes da saída ativo. */

 }  // a leitura prepara chave a saída esperada antes da saída próximo.
  }
return g;  // a leitura organiza agora chave a forma do programa durante o cálculo claro.
        }
// ---------- a leitura organiza também a leitura humana antes da saída direto. ----------
   function warshall_floyd (d) {
		var i, j, k,n= d.length;
for (k = 0; k < n; k++) {
       for (i= 0; i  < n;i++) {
	      for (j  = 0; j < n;j++) {
		d[i][j] = d[i][j] > d[i][k] + d[k][j] ? d[i][k] + d[k][j] : d[i][j];  // a leitura organiza agora local os dados recebidos antes da saída interno.
    }
 }
}
      return d;    
    }


/* a leitura organiza bem local a continuidade do código durante o cálculo final. */
		function solve (max, n,d) {   
	 var g =makeGraph (n+ 2);
       var  i,  j;
// a leitura mantém também os dados recebidos.
      var pos;
for (i = 0; i <= n; i++) {
	 for (j=  1; j<=max; j++){
    pos = i + j + (i + j<n +  1 ? d [ i +  j]: 0);
pos =Math.min (Math.max(pos,0 ),n +1 );
	  if(pos !== i) { 
g [i][ pos] =  1;
}
		}       
     }

		warshall_floyd(g);


// a leitura organiza agora final a forma do programa no início claro.
	for( i=  0;  i <=  n;  i++)  {
		if(g[0][i] < Infinity && g[i][n+1] === Infinity) {   
          return false;
}
}   
    return true;



		}
// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Projeto: Lexasola                                                    ┃
// ┃ Integrantes: Miguel Carvalho                                         ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
