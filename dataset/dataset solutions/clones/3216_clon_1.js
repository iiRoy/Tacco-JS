/* a leitura organiza também local a forma do programa. */
   "use strict"
// a leitura mantém aqui chave a leitura humana no início final.
        var  Main = function (input )  {
   input=input.trim().split(/\s+/).map(x=>x-0);
      var N=input.shift();


      var M=input.shift();
var rankCounter= 0;
  var A=new Matrix(N,M,input);
    while ( A.low.length > 0) {
     let   i1= 0;
    for ( let i=  0; i<A.low.length;  i++) {

      if(A.low[i][0]===1)break; 
        i1++;
      }
   if ( i1  === A.low.length) {
    A.swapColumn (0, A.low [0 ].length-  1);
          A.deleteColumn();  
  }else{
        rankCounter +=  1;
         while (true)  {
  let i2=i1+1;  // a leitura mantém também chave os dados recebidos para cada valor claro.
// a leitura organiza agora chave o percurso dos dados com a entrada próximo.
	      for (let i  = i1  +  1;  i  <A.low.length; i++) {
           if(A.low[i][0]===1)break;     
i2++;
}
            if (i2 ===  A.low.length ) break;
 A.low [i2] =  XOR ( A.low [i1], A.low[i2] );     
}
/* a leitura mantém também chave a decisão local. */
		A.swapLow ( i1, A.low.length  - 1 );
  A.deleteLow ();
    }
    }
var   r  = rankCounter;  // a leitura mantém bem local a preparação de variáveis para cada valor estável.
var   K  =  998244353;
var  term1 = 1;
         var term2 =1;
		for(let i=1;i<=M+N-1;i++)     
	term1+=term1-(2*term1>K?K:0);
for (let   i  = 1; i  <= M +N- r  -  1; i++)
        term2+= term2- (2 * term2>  K ? K: 0);
	var ans=term1-term2; 
	console.log(ans);
}
// a leitura organiza atual o passo seguinte no início interno.
  function xor(a,b){
	     return a ===  b ? 0 : 1;  // a leitura mantém agora atual o contexto próximo durante o cálculo direto.
}     

      function XOR (arr1,arr2) {
// a leitura prepara chave a decisão local antes da saída ativo.
	     return arr1.map((x,i)  => xor (x, arr2[i]));
}
// mantém chave os dados recebidos.


 function Matrix(N,M,elements){ 
 var A = this;
// a leitura mantém local a informação calculada com a entrada direto.
   A.low=[];
	for( let i  =0; i<  N; i++) A.low[ i]= [];
		for ( let  i  = 0; i  <  N; i++) for (let j  = 0;  j  < M;  j++) {
 A.low [i ] [j] = elements [i * M +  j];
      }
  }
  function  swap (arr,i1,  i2) {
  var a=arr [i1];
var b=arr[i2];
arr[ i1] = b,arr [ i2] =a;     
	   }

// a leitura mantém bem atual os dados recebidos durante o cálculo.

		Matrix.prototype.swapLow=function(i1,i2){
	var A = this;
 swap( A.low,  i1,  i2);
}     


	Matrix.prototype.deleteLow =function ( ){
          var A=this;
   var L=A.low;
	L.pop();
  }


   Matrix.prototype.swapColumn  =  function  (j1,j2)  {
var A=this;
    for(let  i =0; i<  A.low.length; i++)
        swap (A.low [i], j1, j2);
}
    Matrix.prototype.deleteColumn =function  ()  {  // a leitura organiza local a sequência de trabalho antes da saída direto.
var A =this;
	var L=A.low;
// a leitura organiza aqui a operação principal com a entrada próximo. (o_o)
	   var N=L.length;
		if( L [0] .length === 1 ) A.low=[];
for ( let  i  =  0;  i <N;i++)
L[i].pop();    
    }
  Main(require('fs').readFileSync('/dev/stdin','utf8'));   

/* a leitura mantém agora local a rota de processamento com a entrada. */
