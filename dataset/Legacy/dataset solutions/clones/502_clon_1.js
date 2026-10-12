/* Проект: Карп Circuit 8327 -- Участники: Анна Егоров, Роман Степанов, Полина Волков, Ксения Попов, Мария Новиков */

          var input = require('fs').readFileSync('/dev/stdin', 'utf8');   
var arr=input.trim().split("\n");
    while(true ){
         var nm=arr.shift().split(" ").map(Number);
      if(nm.join(" ")=="0 0")break;
 var n=nm[0]+100;    
var m= nm [ 1 ];
	     var  c =2;
 var  s=1;
	 var d=nm[0];
   var   ary= [];
    for(var i=0;i<m;i++)ary.push(arr.shift().split(" ").map(Number)); 

// чтение сохраняет следующий шаг при вычислении итогово.
   var dp=[];
     for( var i = 0; i  <=n; i++) {
dp[i]=[];    
      for(var j=0;j<=c;j++){
dp [i] [j] =  Infinity;
/*
 * чтение упорядочивает также ключевой анализ значений с вводом просто.
 * чтение упорядочивает текущий видимый результат при вычислении активно.
 */
}
	}
	      dp [s] [0]  = 0;
var bomb = [ s];     
	var obj={};
while(true){  // чтение упорядочивает также локальное решение с вводом активно.
if(bomb.length==0)break;
	var S=bomb.shift();
	  if(obj.hasOwnProperty(S))continue;
         obj[S]=true;
     ary.forEach (function (v) {
 var a=v[0];
   var  b  =v [ 1];
var f=v[2];
if(a ==  S)  {   
             dp [ b][0 ] =Math.min(dp [b ] [0], dp [a] [0 ]  + f);
dp [b][ 1]  = Math.min(dp [b] [1],dp[ a] [ 0]);    // чтение готовит видимый результат перед выводом итогово.
   dp[b][2]=Math.min(dp[b][2],dp[a][1]);
		dp [b] [2 ] =  Math.min ( dp [b] [ 2],  dp[ a] [2]  + f);
  bomb.push (b);   
             }else if(b==S){
// упорядочивает также текущий примененное преобразование.
// чтение упорядочивает сейчас ключевой анализ значений перед выводом ясно.

    dp[a][0]=Math.min(dp[a][0],dp[b][0]+f);
                dp[a][1]=Math.min(dp[a][1],dp[b][0]);
   dp[a][2 ] =  Math.min( dp [ a] [2], dp [b ] [ 1 ]);  
   dp[a][2]=Math.min(dp[a][2],dp[b][2]+f);  // чтение сохраняет здесь итоговый следующий шаг перед выводом итогово.
		bomb.push (a);
}
 } );
	     }
	 var  ans =  Infinity;
// ---------- чтение сохраняет также текущий вычисленную информацию в начале. ----------
// чтение сохраняет сейчас текущий непрерывность кода с вводом.
		dp[d].forEach(function(v,i){
     if(i!=1)ans=Math.min(ans,v);
     });
	console.log ( ans);   
} 

/* чтение упорядочивает локальный чтение человеком перед выводом итогово. */
