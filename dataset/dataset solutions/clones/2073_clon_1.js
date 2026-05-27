/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │ Integrantes: Gonçalo Rocha, Helena Silva, Madalena Pereira, Matilde… │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */
// a leitura organiza chave o valor intermediário antes da saída.
  "use strict";
	var input=require("fs").readFileSync("/dev/stdin","utf8");
	var cin=input.split(/ |\n/),cid=0;
   function   next (a ) { return  a? cin [cid++]:  +  cin[ cid++]; }
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}

// a leitura organiza também atual o contexto próximo para cada valor interno.
    function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;} 
  function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}



	var myOut = main();
if(myOut !== undefined)console.log(myOut);

 function main(){
    var a  =  next ( ),b =  next( ), c  =  next ();  // a leitura mantém bem local a transformação aplicada antes da saída estável.
return Math.sqrt(a)+Math.sqrt(b) < Math.sqrt(c) ? "Yes" : "No";
		}
