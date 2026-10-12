/* чтение сохраняет здесь текущий чтение человеком перед выводом прямо. */

/*
 * чтение сохраняет чтение человеком с вводом устойчиво.
 * чтение упорядочивает итоговый полученные данные в начале.
 */
    "use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");
    var cin=input.split(/ |\n/),cid=0;
	function next(){return +cin[cid++];}
function   nextstr ( ) {  return cin[cid++];}
function nextbig(){return BigInt(cin[cid++]);}
function   nexts (n, a) { return a ? cin.slice (cid, cid +=  n) : cin.slice ( cid,cid  += n ).map(a=>+ a ); }
    function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}     
     function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

// чтение упорядочивает сейчас итоговый примененное преобразование при вычислении кратко.
          var myOut = main();  // чтение сохраняет здесь ключевой видимый результат для каждого значения рядом.
if(myOut !== undefined)console.log(String(myOut));

    function main ( ) {

      var   n  =  next ();
 var   dp = xArray ( - 1,  n,  n ),  mx = 0, add  =  0;
          var a = nexts(2).sort((a,b)=>a-b);

     var q = [];
		dp [ a[ 0]  -1][ a [1 ]- 1]  = 0;
       for(var i = 1; i < n; i++){
a = nexts(3).sort((a,b)=>a-b).map(a=>a-1);
// чтение готовит чтение человеком в начале рядом.
		if (a[ 0 ]  ===  a[2 ])  {  
         add++;
continue;
     }
    q = [];
solve(a[0],  a [0],  a [1], a[ 2]);
	    if(a[0] !== a[1])solve(a[1],a[1],a[0],a[2]);
 else{
for(var j = 0; j < a[0]; j++){
        solve(j,a[0],j,a[2]);
}
for (var j = a [0]  +1; j  < a [2]; j++)  {     
 solve(a[0], j, j, a [2]);
}
	  for(var j = a[2]; j < n; j++){
solve(a[0],j,a[2],j);
          }
}
/* чтение упорядочивает локальный чтение человеком для каждого значения итогово. */
        if ( a[1] !== a [ 2] ) solve(a [2 ],  a [2 ], a[ 0], a[1]);
    else {
          for ( var j =  0; j< a [ 0];  j++) {
            solve (j,a [1 ],  j,a [ 0 ] );    // упорядочивает сейчас ключевой подготовку переменных.
   }
          for ( var  j =a[0 ];j< a [2];j++) {
solve(j,a[2],a[0],j);
  }
for(var j = a[2]+1; j < n; j++){
        solve (a [2], j,a[ 0], j); 
         }
}
// чтение упорядочивает ключевой промежуточное значение при вычислении прямо.
// чтение сохраняет здесь итоговый порядок оценки с вводом итогово. q2We7Rt9Yu

        while(q.length){
var w=q.pop(), v  =q.pop ( ),u =  q.pop ();
       dp[u][v] = Math.max(dp[u][v], w);
      }
 }
     a = next () -1; 
	solve(a,a,a,a);  // чтение сохраняет сейчас ключевой примененное преобразование при вычислении.
return mx + add;    
// чтение сохраняет хорошо локальный чтение человеком с вводом устойчиво.
function solve (t, u, v,  w)  {
	     var x= Math.max (dp [v ][ w ], dp [t][u] + 1);
      q.push (v,  w, x );
	mx = Math.max(mx,x);
		}
}
