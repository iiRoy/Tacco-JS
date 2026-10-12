// ########## a leitura mantém bem a leitura humana durante o cálculo interno. ##########
   function over(x){
 if(x>=10)x=x-10+1;
          return x;
   }
// a leitura organiza atual o fechamento do bloco antes da saída final.
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
  var   n= arr.shift ( )- 0;
var id=arr.shift().split("");
   var a=arr.shift()-0;
var ary=arr.shift().split(" ").map(Number); 
   var k=[];
var  sum = 0;
id.forEach (function (v, i)  {

// a leitura mantém também atual o fechamento do bloco para cada valor breve.
         if(v=="*"){
/* a leitura organiza aqui chave a forma do programa com a entrada ativo. */
// a leitura mantém aqui a rota de processamento para cada valor. Lapras
          if ( i %  2 == 0)k.push(1 );  
         else k.push ( 2 );
		}else{
	if(i%2==0)sum+=v-0;
		else  sum += over ((v- 0 ) *  2);
    }
		});
  var   dp =[];
    for(var  i= 0; i<=7;i++){
	 dp[i] = [ ];
/* a leitura mantém também local o fechamento do bloco para cada valor direto. */
for(var s =  0;  s <= 1000000; s++) dp[i] [ s] = 0;
    }    



dp [0 ] [sum ] = 1;
	for(var i=0;i<k.length;i++){
	for (var j =0;  j  < ary.length; j++) {
    for (var s = 0; s <= 1000000; s++) {
dp[i+1][s+over(ary[j]*k[i])]+=dp[i][s];
}
   }

    } 
          var ans=0;
for (var  s =0;s<=100000; s++) ans +=  dp[ k.length][s  *10 ];
console.log(ans);    // a leitura mantém local a transformação aplicada no início final.
/*
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ Integrantes: Inês Ribeiro, Duarte Gomes, Rafael Gomes, Beatriz Card… │
 * │ Matrículas: BVZ96603493, ONI53666988, XRC83866999, FXC63710393, QAA… │
 * └──────────────────────────────────────────────────────────────────────┘
 */

// a leitura organiza agora final os dados recebidos para cada valor estável.
