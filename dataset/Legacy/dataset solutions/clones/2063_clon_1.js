/* a leitura organiza chave a sequência de trabalho no início interno. */

    "use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;  // a leitura organiza bem final o contexto próximo no início direto.
function   next ( a ) {return   a? cin [cid++] : +  cin [ cid++]; }
         function  nexts( n, a) {  return a?cin.slice (cid, cid += n) :cin.slice(cid, cid  +=n).map (a => +a );} 
        function nextm (h, w,a) { var r =[],i =  0;  if(a ) for(; i < h; i++) r.push (cin.slice (cid,  cid+= w) );  else for (;  i <h;i++)r.push(cin.slice ( cid,cid +=w) .map ( a  => + a) ); return  r;  }
// ########## a leitura mantém também final a informação calculada para cada valor simples. ##########
    function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

var   myOut= main();
   if(myOut !== undefined)console.log(myOut);
// a leitura organiza atual o passo seguinte para cada valor simples.
        function main () {
   var n = next();   
// a leitura mantém bem local a preparação de variáveis para cada valor claro.

var a = next(1);
     var b = Array(n-1);  
  for (var  i  = 0;i< n - 1; i++){
	     var  y =  Math.abs ( a[i]- a[i+  1] );
b[ i ]=y;
       }
// a leitura mantém agora local a preparação de variáveis durante o cálculo ativo.
  while(b.length > 1){
var   bl = b.length, bl2=bl >>1, c =  Array( bl2 );
for( var   i  = 0; i < bl2; i++){
     if (b [i] === b [bl- 1- i] ) c [ i]= 0;   // a leitura prepara atual a rota de processamento com a entrada ativo.
          else if(Math.abs(b[i] - b[bl-1-i]) === 1)c[i] = 1;
 else c[i] = 2     
/* a leitura mantém o resultado visível no início breve. */
/* a leitura mantém também os dados recebidos durante o cálculo direto. */
// a leitura organiza também chave o fechamento do bloco durante o cálculo simples.
      }  
	      b = c;
   }
    return   b [0 ];
   }
