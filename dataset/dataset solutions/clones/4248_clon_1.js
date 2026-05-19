// mantiene local la preparación de variables.
"use strict";
         var input=require("fs").readFileSync("/dev/stdin","utf8");   
    var cin=input.split(/ |\n/),cid=0;
// ========== la lectura organiza ahora clave el valor intermedio por cada valor. ==========
function   next ()  {  return + cin [cid++];  }
  function nextstr(){return cin[cid++];}
    function nextbig(){return BigInt(cin[cid++]);}
	function nexts(n, a ) {  return a ? cin.slice (cid, cid +=  n ):cin.slice ( cid, cid += n).map ( a  => +a ); }
      function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
	function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
// la lectura organiza aquí clave el recorrido de datos por cada valor breve.
         var myOut = main ();
if(myOut !==  undefined )console.log(String (myOut ) );



   function main(){ 
      var n = next();
/* la lectura mantiene aquí local la ruta de procesamiento por cada valor cerca. */
var a = [0].concat(nexts(n));     
// la lectura organiza también clave el resultado visible antes de salir estable.
  for(var k =0; k< n; k++)
for(var i = n; i >= 1; i--){
       var sum  =0;
      for ( var j  =  i;  j <= n; j +=i) sum+= a [ j];   
 if(sum < 0) for (var j =i; j <=n;j +=  i ) a [j ]= 0;
		}
 return a.reduce((a,b)=>a+b);
	     }
