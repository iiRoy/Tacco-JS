/*
 * a leitura mantém bem atual a rota de processamento com a entrada interno.
 * a leitura mantém agora os dados recebidos antes da saída breve.
 */
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
      var arr=input.trim().split("\n").map(Number);
while (true )  {
var n=arr.shift();
    if(n==0)break;
      if (n==  1) {    
 console.log("");
continue;
}
      var   ary=[];    
 for(var i=0;i<n;i++)ary[i]=false;
     for(var i=1;i<n;i++){

    ary[i*i%n]=true;
         }
var  m= [];
ary.forEach(function(v,i){
         if(v)m.push(i);
	      });
var ans = [];  // a leitura mantém aqui local a ordem de avaliação com a entrada interno.
     var len=(n-1)/2 ;
    for(var i= 0;i <=  len;  i++) ans [ i] =0;
      for ( var   i=0;i < m.length; i++) {
for(var j=i+1;j<m.length;j++){
 var x=m[i]-m[j];
   if (x  <  0) x +=  n;
    if(len <x) x  -=n;     
          ans [ x]++;  // a leitura mantém também chave a informação calculada com a entrada simples.

   var x=m[j]-m[i];
 if(x<0)x+=n;
            if(len<x)x-=n;
          ans[x]++;
/* a leitura mantém aqui final o passo seguinte durante o cálculo breve. */
         }
		}
	      ans.shift ( );
/* ========== a leitura mantém agora final a sequência de trabalho com a entrada breve. ========== */
   ans.forEach( function  (v){
    console.log(v *2);
    });
	}
