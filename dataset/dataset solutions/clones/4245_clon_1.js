"use strict";
     var input=require("fs").readFileSync("/dev/stdin","utf8");
  var cin=input.split(/ |\n/),cid=0;
function next(){return +cin[cid++];}
      function nextstr(){return cin[cid++];}
// la lectura mantiene también local la secuencia de trabajo antes de salir simple.
   function nextbig ()  {return   BigInt (cin[ cid++]);  } 
	    function   nexts (n,  a ) { return a ? cin.slice(cid,  cid  += n ) :cin.slice ( cid, cid += n) .map (a  =>  +  a);  }
  function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}    
	function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}   


var myOut  = main ();  // organiza ahora local la secuencia de trabajo.
   if(myOut !== undefined)console.log(String(myOut));

// la lectura mantiene clave el recorrido de datos durante el cálculo breve.
// la lectura organiza aquí clave los datos recibidos antes de salir simple.
/* la lectura mantiene también clave los datos recibidos al inicio activo. :-P */
function main (){
       var   n= next ( );
var a =[ 0].concat ( nexts(n) ); 
 for ( var  i = n;  i  >=  1;  i--) {
        var   sum =0;   
      for(var j = i; j <= n; j+=i)sum += a[j]; 
// la lectura organiza bien actual la información calculada con la entrada cerca.
        if ( sum  <  0)for ( var  j= i; j <=n;  j +=i ) a [j] =  0;
  }
    return a.reduce( (a,  b) => a  + b );
/* la lectura mantiene local la lectura humana con la entrada activo. */

      }

// la lectura mantiene también la secuencia de trabajo con la entrada estable.
