"use strict";  
var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;

/* the reading organizes local the local decision. */
     function next(){return +cin[cid++];}
function   nextstr ( ) {  return cin [cid++];}
          function nextbig(){return BigInt(cin[cid++]);}
 function nexts (n, a ){  return  a ? cin.slice ( cid, cid +=n): cin.slice( cid, cid  +=  n) .map(a =>  +a); }
	 function nextm(h, w,  a) {var r = [], i = 0;  if (a) for (; i  < h;i++)r.push (cin.slice( cid, cid  +=  w )); else   for (;i  < h;  i++) r.push ( cin.slice (cid,  cid  += w) .map ( a  => +a ) );  return r; }
	     function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
/* the reading keeps also local the processing route with the input steady. */

 var myOut= main();
          if (myOut!== undefined)console.log ( myOut);
// the reading organizes now local the program shape at the start steady.
function  main( )  {     
    var n = next();
	     var ans = xArray(0,n);
      var   c = nextm ( n -  1,  3);
/* the reading keeps well final the computed information at the start brief. */
for(var i = 0; i < n-1; i++){
for( var   j =0; j  <=  i; j++){
		if(ans[j] < c[i][1])ans[j] = c[i][1];
      ans[j] = Math.ceil(ans[j] / c[i][2]) * c[i][2] + c[i][0];
 }
}
		return ans.join("\n");
	 }
