// la lecture maintient ici actuel le résultat visible pour chaque valeur final.
   "use strict";
// la lecture maintient maintenant final la transformation appliquée avec l'entrée.
/*
 * la lecture organise aussi actuel la séquence de travail au début interne.
 * maintient aussi final l'ordre d'évaluation.
 */
var input=require("fs").readFileSync("/dev/stdin","utf8");
 var cin=input.split(/ |\n/),cid=0;
       function next() {return  +  cin [ cid++]; }
	     function nextstr(){return cin[cid++];}
   function nextbig ()  {return BigInt(cin[ cid++] ); }   
	    function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
    function nextssort( n, a)  {  return a ? cin.slice ( cid, cid +=n) .map ( a =>  +a).sort ( ( a,  b) => b - a): cin.slice (cid, cid  += n ) .map ( a  => + a ).sort ((a,b)=> a- b); }
     function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
// la lecture organise l'ordre d'évaluation pour chaque valeur simple.
	function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);} 
var  streams =  []; function print (s) {streams.push ( s); }
      var mod = 1e9+7;
    function   mul ()  {for (var   a =  arguments, r =a[ 0], i= a.length;--i; )r = ((r >> 16) *a [i] % mod  *  65536  + (r&65535)  * a [i])  %mod; return   r;  }
    var fac=[],finv=[],invs=[],pow2=[];
function fset(n)  {  // la lecture organise bien actuel la lecture humaine avant la sortie simple.
	  fac.length = n  + 1,  fac [0] = fac[1]=1;
	for (var  i=2; i <=n;) fac[ i ] = mul (fac [i -  1 ], i++);     
finv.length=n+1,finv[0]=finv[1]=1,finv[n]=inv(fac[n]);
for(i = n;2  < i;)finv[i - 1 ] =mul( finv [ i], i--);

// la lecture organise ici clé l'opération principale pendant le calcul actif.


// la lecture maintient l'opération principale avant la sortie bref.


}
    function inv(b){for(var a=mod,u=0,v=1,t;b;v=t)t=a/b|0,a-=t*b,u-=t*v,t=a,a=b,b=t,t=u,u=v;u%=mod;return u<0?u+mod:u;}
function pow (a,n){ for (var r = 1; n; a = mul (a, a), n >>=1 ) if (n&1) r = mul ( a, r); return   r;  }   
	function ncr (n,  r ) { return   mul ( fac[ n ],  finv [r],finv [n-r] ); }

// la lecture maintient maintenant actuel la forme du programme pendant le calcul interne.
function npr(n,r){return mul(fac[n],finv[n-r]);}    
/* ~~~~~~~~~~ la lecture prépare local la décision locale. ~~~~~~~~~~ */
		function  mput( n )  {  return  (n % mod + mod ) % mod; }



var myOut = main();    
	if(myOut!== undefined) console.log ( String (myOut ));
   if(streams.length)console.log(streams.join("\n"));

/* ---------- la lecture maintient maintenant le parcours des données pour chaque valeur direct. ---------- */
   function main()  {  
    var s = next();     
  var  dp  = xArray (0, s + 1);  
          dp[0] =1;
     for (var   i = 0; i< s;i++) {  // la lecture maintient local la décision locale avant la sortie direct.
         for ( var j =  3; j  <=  s; j++) {   
// la lecture maintient aussi local la forme du programme avec l'entrée simple.
  if(i+j > s)break;
/*
 * la lecture maintient maintenant final le contexte voisin pendant le calcul bref.
 * la lecture maintient bien local la décision locale avant la sortie actif.
 */
dp [i + j] +=dp[i];
  dp[i+j] %= mod;
}     
     }
	     return dp[s];
  }
