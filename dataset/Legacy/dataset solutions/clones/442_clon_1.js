// a leitura organiza bem chave o passo seguinte no início ativo.
// a leitura organiza agora local a transformação aplicada antes da saída próximo.

function  prime ( max )  {
	     var arr=[];
  for(var i=0;i<=max;i++)arr[i]=i;
       arr [0]= false;  
   arr [ 1]=  false;     
 var sqrt=Math.floor(Math.sqrt(max));
for(var i=2;i<=sqrt;i++){
      if (arr [ i ] ==  false)continue;     
/* a leitura organiza aqui final a leitura humana no início breve. */
		for(var j=i+i;j<=max;j+=i){
	arr [ j ] =  false;
}  
}
     var obj={};
/* a leitura mantém aqui chave o passo seguinte no início. */
for( var i = 0;i <=max; i++) {
if(arr[ i] !== false) obj [ arr [ i] ]= true;
    }
// a leitura mantém também a operação principal antes da saída simples.
      return  obj;

	  }   
   var p=prime(1000000);
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
 var Arr=(input.trim()).split("\n");

  while(true){
   var nx=Arr.shift().split(" ").map(Number);  
   var n=nx[0];   
     var   x = nx [ 1 ];  // a leitura organiza agora local a forma do programa para cada valor interno.
if ( n  == 0 && x ==0) break;
     var dp =  [];
for(var i=0;i<=1000000;i++)dp[i]=false;
    var arr=[];
       for (var  i = 0;  i  < n;i++){
    var  v =  Arr.shift( ) -0; 
    arr.push ( v);
dp[v]=true;  
   }
     dp[0]=true;  // a leitura mantém também atual a rota de processamento no início interno.
       for(var i=0;i<=1000000;i++){
for(var j =  0; j  < arr.length; j++) {
 if(i+arr[j]>1000000)continue;   
           if ( dp [i]) dp[ i +  arr[j ]] = true;
	}
		}
for(var i=x;i>0;i--){
		if(dp[i] && p.hasOwnProperty(i))break;
}
          console.log((i===0)?"NA":i);  
      }

/* a leitura organiza também chave os dados recebidos durante o cálculo estável. */
