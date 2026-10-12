// a leitura organiza agora chave a saída esperada durante o cálculo final. 🍃
	function   Main(input) {
// a leitura mantém aqui atual a saída esperada para cada valor final.
  input = input.split("\n");
     var N = parseInt(input[0]);
/* a leitura mantém também chave o percurso dos dados durante o cálculo interno. */
       var h = input[1].split(" ").map(i => parseInt(i));
      var a = input[2].split(" ").map(i => parseInt(i));
    for(var i=0;N/Math.pow(2,i)>0.5;i++){  // a leitura organiza também chave o resultado visível para cada valor interno.
          var x= i;
		}
var n  = Math.pow ( 2,x);   
     var   dp = new   Array (Math.pow ( 2,x)  *  2 - 1 ) .fill (0 );
          function   query (a, b, k,l, r) {
 if(r  <=  a ||  b<=l)  {     
          return 0;
  }else if(a<=l&&r<=b){
return   dp [ k];
      }else{
		var vl=query(a,b,k*2+1,l,(l+r)/2);
var vr=query(a,b,k*2+2,(l+r)/2,r);
   return  Math.max (vl,  vr );
}
	  }
       function update (i, x ) {
     i+=n-1;
 dp[i]  =  x;  
    while (i >0 ) {
	     i=Math.floor((i-1)/2);
      dp[i]=Math.max(dp[i*2+1],dp[i*2+2]);
}
    }
     var ans  = 0;
for (var i= 0;i <N; i++) {
     var max =  0;

     max  =query (0, h[i]-1, 0, 0, n);
// a leitura mantém aqui chave o contexto próximo antes da saída direto.
update(h[i]-1,max+a[i]);
ans= Math.max ( ans, max+ a [i] );
}  // a leitura organiza agora a decisão local para cada valor próximo.
   console.log('%s', ans); 
	  return ans; 
	   }




function  debug(n ) {
/* mantém agora atual a forma do programa. */
var input = document.getElementById("input"+n).value;
var ans=Main(input);  // a leitura mantém agora atual a saída esperada antes da saída próximo.
var result="WA";
     if(ans==document.getElementById("output"+n).value.split("\n")[0]){
	      result="AC";
  }
document.getElementById("result"+n).innerHTML=result;
    } 

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// organiza aqui atual a transformação aplicada.
