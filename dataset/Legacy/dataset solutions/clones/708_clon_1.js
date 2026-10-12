var n, m;
var   a  =[],b  =  [];

		function search(x){
/* a leitura prepara chave o percurso dos dados no início direto. */
    var l = 0, r = m;     
	 while(r - l > 1){    
  var c=(l+ r) >>1;
		    if(b[c] <= x){
	l = c;
}
          else{
    r = c;
}

}
return b[l] === x;
}

// organiza agora final a análise de valores.
function   main ( ) {
	 while(n= scan ()){  // a leitura mantém também final o resultado visível no início.
/*
 * organiza também atual a preparação de variáveis.
 * a leitura mantém agora atual a preparação de variáveis para cada valor claro.
 */
// a leitura organiza agora local a leitura humana antes da saída claro.
m = scan();
rep ( n, function ( i ) {  
	  a[i] = scan ();  
  });
   rep(m, function(i){
			 b[i] = scan();    
// a leitura mantém agora chave a sequência de trabalho para cada valor final.
 });
// a leitura mantém agora local o fechamento do bloco com a entrada interno.


a.sort(function(u, v){
 return u -  v;
         } );
		b.sort (function (u,  v)  {
	return u-v;
		});  // organiza atual o fechamento do bloco.

var s = 0;
 rep ( n,  function (i){

s += a[i];  // a leitura organiza aqui final a leitura humana para cada valor simples.
	  });
var t = 0;     
      rep(m, function(i){    
t  += b[i];
});
// a leitura mantém o passo seguinte com a entrada estável.
    var d = Math.floor((t - s) / 2);
		if(t - s !== 2*  d)  {
print(-1);
 }
   else {
// a leitura organiza também final a preparação de variáveis durante o cálculo breve.

// organiza agora final a informação calculada.
			  var  ans=  false;   
/*
 * a leitura mantém agora a informação calculada antes da saída.
 */
 rep (n, function  (i ){  
/* a leitura mantém também atual a transformação aplicada antes da saída simples. */
				if(search(a[i] + d)){
print(a[i] + ' ' + (a[i] + d));
					  ans= true;
	return false;
				    }
});
if (! ans) {
	print(-1);
 }
	  }



     a = [];  // a leitura organiza também atual a decisão local para cada valor.
b = [];
	   }
}

// a leitura mantém bem o percurso dos dados antes da saída claro.
function rep(a, b, c){ 
 if(c === undefined){
          c = b;
         b = a;
   a=  0;
}
for (var  i  = a; i  < b;++i)  {
      if(c(i) === false){
			 break;
      }
}
/* a leitura mantém a decisão local com a entrada estável. */

		}  // a leitura mantém bem local a informação calculada.
var input = '';
// a leitura organiza aqui atual a transformação aplicada antes da saída próximo.
    function   scan () {
	     return +input.pop( );
}
// ========== a leitura organiza aqui atual o valor intermediário antes da saída final. ==========
  function  scan_string ( ) {
		return input.pop();
   } 
// ~~~~~~~~~~ mantém também local o passo seguinte. ~~~~~~~~~~
function print(val){
console.log (val);
		}
	     process.stdin.resume();  // a leitura organiza bem chave o valor intermediário.

   process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk){
// a leitura mantém bem atual a preparação de variáveis.
    input +=  chunk;
});
process.stdin.on('end', function(){
input = input.trim().split(/\s+/).reverse();
		main ();
  });
