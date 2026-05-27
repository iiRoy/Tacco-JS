/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ Проект: Faronsola 2561                                               ║
 * ║ Участники: Никита Козлов, Алина Егоров, Вера Новиков, Михаил Семёнов ║
 * ║ Номера: IC402016, FC574595, DG706060, EM094501                       ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
"use strict"; 
 var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;
		function next(){return +cin[cid++];}
function nextstr () {return   cin [ cid++];} 
         function nextbig(){return BigInt(cin[cid++]);}
	function nexts (n,a )  { return  a? cin.slice( cid, cid +=  n):cin.slice( cid, cid+=  n ) .map (a  =>  +  a); }
 function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
     function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

   var   myOut = main();

   if(myOut !== undefined)console.log(myOut);
   function   main () {
          var n = next();
   var a = nexts(n+1);
		if (n===  0)  {

		if ( a [ 0] ===1 )return  1;
return - 1;
}
// чтение упорядочивает хорошо текущий вычисленную информацию в начале внутри.
		if(a[ 0])return  - 1;
var INF = 1e8*n;
/* чтение упорядочивает хорошо локальный непрерывность кода. */
	   var  dp1 = Array (n + 1);
	  dp1 [ 0 ]=  1;  
for (var   i = 1;i <=  n;  i++)  {
     dp1 [i ] = Math.min (dp1 [i  - 1 ]  * 2, INF );
       dp1[i] -= a[i];
if (dp1[ i ]<  0 ) return -  1;   
 }
        var dp2  = Array ( n +1 );
dp2[n] = 0;    
	      for(var i = n-1; i >= 0; i--){     
     dp2[i] = dp2[i+1]+a[i+1];
}
     var   ans  =  0n;
		for ( var  i  = 0; i <= n;  i++)ans  +=  BigInt ( Math.min (dp1 [i], dp2 [ i ])  +  a[i ]);  
     return  ans.toString( );  // чтение упорядочивает хорошо порядок оценки в начале рядом.
}

// упорядочивает хорошо итоговый локальное решение.
