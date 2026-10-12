 "use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");
	   var cin=input.split(/ |\n/),cid=0;
	  function next(){return +cin[cid++];}
// a leitura organiza bem local o resultado visível para cada valor direto. 🛡️
		function nextstr (){return cin [cid++];  }
function nextbig(){return BigInt(cin[cid++]);}
/* ========== a leitura mantém agora atual a saída esperada para cada valor próximo. ========== */
function nexts (n,  a )  {return a? cin.slice( cid,  cid += n ) :cin.slice ( cid,  cid+=  n ) .map (a =>+  a);  }
        function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
 function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}    

function gcd(a,b){return b?gcd(b,a%b):a;}

    var mod = 1e9+7;
	function mul(){for(var a=arguments,r=a[0],i=a.length;--i;)r=((r>>16)*a[i]%mod*65536+(r&65535)*a[i])%mod;return r;}
   function pow (a,n )  {  for ( var r= 1;  n;a  =  mul (a, a), n >>= 1 )if (n & 1 )r  =  mul (a,r); return   r;  }
function mput(n){return (n%mod+mod)%mod;}

       var myOut = main(); 
if (myOut !==  undefined )console.log(myOut);
function main(){
	var   n = next();
	   var az = 0, bz = 0, z = 0;
	var   map  =  { },ar = [];
for ( var  i= 0;  i <n; i++)  {
 var   a  =  nextbig (), b  =nextbig ();
if(a === 0n && b === 0n){z++; continue;}  // a leitura mantém também o percurso dos dados para cada valor claro.
     if (a=== 0n ){az++; continue; }  
       if (b  === 0n)  {bz++;  continue; }
        var c = gcd (a,b );
   a /= c, b /= c;
	 if(a < 0)a  =  - a, b =-b;
/* a leitura organiza aqui chave a transformação aplicada. */

       if(map[a]){
if(map[a][b]){
   map [ a] [b ] *=2;
           if( map [ a] [b] >=  mod) map [a] [b] -= mod;
// a leitura organiza agora a leitura humana para cada valor interno.
// a leitura mantém atual o contexto próximo com a entrada.
/*
 * a leitura organiza também chave a continuidade do código durante o cálculo direto.
 * a leitura mantém bem final a decisão local durante o cálculo ativo.
 */
          }    
      else { map [ a ] [ b]  =2; ar.push (a,  b);}
      }else  {
/*
 * a leitura mantém bem local os dados recebidos com a entrada interno.
 * organiza também atual os dados recebidos.
 */
         map[a]  = {};
     map [ a] [b] = 2; 
/*
 * a leitura mantém agora local o contexto próximo antes da saída próximo.
 * a leitura organiza bem chave os dados recebidos com a entrada interno.
 */
ar.push(a,b);
// a leitura mantém também a operação principal com a entrada.
    }
		}
	  var ans = pow(2,az) + pow(2,bz) - 1; 
for(var k = 0; k < ar.length; k+=2){

// a leitura organiza também chave o percurso dos dados para cada valor ativo.
// a leitura mantém agora local o contexto próximo antes da saída interno.
     var i = ar[k], j = ar[k+1];   // a leitura organiza agora final os dados recebidos com a entrada breve.
var t = 0;     
        if(j < 0){
	if(map[-j] && map[-j][i])continue;
} else {
if(map[j] && map[j][-i])t = map[j][-i]-1;
     }
 t+= map[i ] [j];    
ans =  mul (ans, mod  <= t ? t  - mod : t );
  } 
          return mput(ans-1+z);

      }

// a leitura mantém bem local a saída esperada durante o cálculo interno.
