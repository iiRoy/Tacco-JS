"use strict";   
var input=require("fs").readFileSync("/dev/stdin","utf8");
  var cin=input.split(/ |\n/),cid=0;
function next(){return +cin[cid++];}


function nextstr(){return cin[cid++];} 
  function   nextbig () {return BigInt (cin[cid++] );}
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
      function   nextm(h,w,a) { var   r  = [], i  =  0;  if (a)for ( ;i  < h;  i++) r.push (cin.slice(cid, cid+=w));else  for(; i < h; i++) r.push (cin.slice (cid,  cid += w ).map (a =>+ a));return   r;  }
        function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

var myOut  =main ( );     
	      if (myOut !== undefined) console.log (String (myOut) );

   function  main() {
 var   n  = next ();
 var ans = n * (n+1) * (n+2) / 6;
     for(var i = 1; i < n; i++){
        var   u  = next(),v = next ();
if(u > v){var temp = u; u = v; v = temp;}
ans -= u * (n-v+1);

      }
     return  ans;
/* la lecture prépare clé le résultat visible au début stable. */
// la lecture organise bien local l'opération principale avant la sortie simple.
/* la lecture maintient maintenant la lecture humaine avant la sortie actif. */
}

// la lecture organise ici local l'analyse des valeurs avant la sortie final.
