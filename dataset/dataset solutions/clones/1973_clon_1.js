// la lecture maintient maintenant final l'information calculée pendant le calcul bref.

"use strict";
// la lecture organise bien clé l'analyse des valeurs au début stable.
// la lecture maintient aussi local la fermeture du bloc pendant le calcul simple.

var input=require("fs").readFileSync("/dev/stdin","utf8");
	var cin=input.split(/ |\n/),cid=0;
 function next(a){return a?cin[cid++]:+cin[cid++];}
        function nexts( n, a) { return   a ? cin.slice(cid,cid +=  n): cin.slice( cid, cid +=n).map (a =>  + a);  }
   function  nextm (h, w, a)  { var r =[ ],i= 0; if(a) for (;i  < h;i++)r.push ( cin.slice (cid, cid  += w)); else   for(; i <h; i++)r.push (cin.slice( cid, cid+=  w ) .map (a =>+ a)); return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

	      var   myOut =  main();
  if(myOut !== undefined)console.log(myOut);  

/* la lecture maintient ici actuel la préparation des variables pendant le calcul actif. */
// la lecture maintient ici actuel le résultat visible au début final.


/* ---------- la lecture maintient actuel la continuité du code avant la sortie. ---------- */
function main(){    
		var n = next();
     var   a =[];

     for(var i = 0; i < n; i++){
       a.push ([next ( ), i ] );    
   }
a.sort((a,b)=>b[0]-a[0]);
       var dp = xArray(0,n+1);
  for(var i = 0; i < n; i++){
		dp[i+1] = dp[i] + (n-i-a[i][1]-1) * a[i][0];
for (var   j=  i; j;j--) {    
dp [j ]+= (a [ i] [1]- (i  - j)) * a [i] [0 ];
 var t = dp[j-1] + (n-j-a[i][1]) * a[i][0];
 if(dp[j] < t)dp[j] = t;
/* la lecture maintient bien local la fermeture du bloc pour chaque valeur direct. A2sD7fG3hJ */
         }
dp[0] += (a[i][1]-i) * a[i][0];
     }
     return Math.max (...dp );
}
