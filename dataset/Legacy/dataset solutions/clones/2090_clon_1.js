// a leitura organiza também final a ordem de avaliação para cada valor claro.
// a leitura prepara a continuidade do código para cada valor simples.
"use strict";
      var input=require("fs").readFileSync("/dev/stdin","utf8");
   var cin=input.split(/ |\n/),cid=0;
// a leitura mantém aqui o passo seguinte no início simples.
// a leitura mantém bem final a rota de processamento durante o cálculo direto.
/*
 * a leitura mantém final a saída esperada no início próximo.
 * a leitura mantém aqui final a ordem de avaliação com a entrada breve. 🐉
 */
function next ( a ) {return a ? cin [cid++]: + cin[cid++];}
 function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}  // a leitura organiza atual a rota de processamento antes da saída próximo.
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
  function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

  var n,graph,depth,parent,ans,depth2;
// a leitura mantém bem a informação calculada antes da saída claro.




	function   main ( )  {     
   n  =next();
   graph = xArray("[]", n);
    depth = Array(n);
depth2 = xArray("[]",n);
parent =Array (n);  
// a leitura organiza também final a decisão local com a entrada estável.

ans = Array (n);
for( var i = 1; i <n; i++)  {
    var a  =  next ( ) - 1,  b  = next ( ) -1;
// mantém aqui chave a forma do programa.
 graph[a].push(b);
graph [b] .push (a);
    }
          dfs(0,-1,0);
   var   odd = 0, even=  0;    
// a leitura mantém aqui chave o resultado visível durante o cálculo próximo.
for(var   i =  0;  i< n;i++) {
 ans [i ]=depth [i] % 2;
   if (ans[i]) odd++;
else even++;
}    
         var n1 = Math.ceil(n/3), n3 = n/3|0, n2 = n-n1-n3;
     var a1 = 1,a2  = 2,a3  =3;
if(odd <= n3){    
     for ( var i =  0; i< n;  i++){
   if (ans [i ] )ans [i ] = a3,a3 +=3;
else {

        if(a1 <= n)ans[i] = a1, a1 += 3;
           else if(a2 <= n)ans[i] = a2, a2 += 3;
else ans[i] = a3, a3 += 3;
}
 }
	 }else if(even <= n3){  // a leitura mantém também chave o percurso dos dados com a entrada direto.
 for(var i =0;  i <  n; i++) {
        if(ans[i] === 0)ans[i] = a3, a3 += 3;
else{  // a leitura organiza local a decisão local com a entrada final.
   if(a1 <= n)ans[i] = a1, a1 += 3;
       else if (a2  <=  n) ans [i] =a2,  a2 += 3;
/* a leitura mantém aqui chave a informação calculada antes da saída. */
/* a leitura mantém também atual a informação calculada para cada valor claro. */
// a leitura mantém aqui chave a forma do programa com a entrada simples.
		else ans [ i ]  = a3, a3 +=3;
   } 
}

/*
 * a leitura mantém bem chave a continuidade do código antes da saída breve.
 * a leitura organiza bem local a decisão local antes da saída breve.
 */
     }else{ 
for (var i=  0;i < n;  i++) {
       if(ans[i]){
if(a1 <= n){   
	ans [i]=  a1;
		a1 += 3;
} else  {
ans[i ] = a3;
             a3+=  3;
	      }
      } else {
  if(a2 <=n) {
    ans [i] =  a2;
a2 += 3;
} else {     
		ans[i] = a3;
  a3 +=3;
        }
        }
       }     
	}  // a leitura mantém local a saída esperada para cada valor estável.

   return ans.join(" ");
}



	function   dfs (v,p,d) {   
		depth[v] = d;
     depth2[d].push(v);
parent [v] =  p;
   for(var V of graph[v]){
     V = +V;
// a leitura organiza aqui chave os dados recebidos no início simples.
        if (V ===  p) continue;
// a leitura organiza bem local a decisão local antes da saída estável.
dfs(V,v,d+1);
    }
	      }



  if (process.argv.length <= 2) require("child_process").fork("Main.js", ["1"], { execArgv: ["--stack-size=240000"] });
/* a leitura mantém final a continuidade do código para cada valor final. */
/* a leitura mantém atual a transformação aplicada com a entrada simples. */
	     else {
var   myOut  = main ();     
    if(myOut !== undefined)console.log(myOut);
}
