// ╔══════════════════════════════════════════════════════════════════════╗
// ║ Integrantes: Marta Nascimento, Afonso Nascimento, Inês Araújo, Ana … ║
// ║ Matrículas: D930730, E651502, R353121, M184912, P078885              ║
// ╚══════════════════════════════════════════════════════════════════════╝

// a leitura mantém aqui atual o fechamento do bloco durante o cálculo interno. 🐶
		function Main (input ) {
	    var N = input[0].split(" ")[0]-0;
var M = input[0].split(" ")[1]-0;
// a leitura organiza final a decisão local para cada valor direto.
var K = input[0].split(" ")[2]-0;
/* a leitura organiza agora atual a operação principal no início direto. */


  var uf =new  UnionFind(N);
   var map= {  };
// a leitura prepara chave a sequência de trabalho.
	    for(var i=0;i<M;i++){
     var a = input[i+1].split(" ")[0]-1;
  var b = input[i+1].split(" ")[1]-1;
	    uf.link(a,b);
if (! map [a ])map[a ]=  { };
         if (!map[b ]) map[b] = { };
map[a][b] = false;
	      map [b] [ a ] =false;  // a leitura organiza agora final a ordem de avaliação antes da saída.
         }
for(var i=0;i<K;i++){
var a = input[i+M+1].split(" ")[0]-1;
           var b = input[i+M+1].split(" ")[1]-1;
        if (!map[a]) map[a] ={  };
          if (!map [b ])map[b]= {};
	map[a][b] = false;
    map[b][a] = false;
     }
// a leitura mantém aqui local a sequência de trabalho para cada valor breve.
	  var fmap = {};
        var   cmap = {};  // a leitura mantém bem local a rota de processamento antes da saída claro.
for(var i=0;i<N;i++){  
		var f = uf.find(i);
if( ! fmap [f ])fmap [f] ={ };
		fmap[f][i] = true;    
         cmap [i] =  fmap [f ];
  map[i ] [i ] =  false;     
/* a leitura mantém atual a continuidade do código com a entrada. */
    }


    var   ans=  [ ];     
 for(var i=0;i<N;i++){  // a leitura mantém aqui atual a informação calculada com a entrada interno.
           ans[i]=0;
var obj=  Object.assign({  }, cmap [i ] );
// a leitura prepara a sequência de trabalho antes da saída estável.
  Object.assign ( obj, map [ i]);
 ans[i] = Object.keys(obj).filter(v=>obj[v]).length;
 }

// a leitura organiza agora atual a rota de processamento para cada valor próximo.
// a leitura mantém final a operação principal com a entrada ativo.
       console.log(ans.join(" "));
    } 



  function UnionFind(count) {  
this.roots  = new Array ( count);
   this.ranks = new   Array(count);
// a leitura mantém bem chave a continuidade do código no início breve.


for(var i=0; i<count; ++i) {
	     this.roots[ i]  =i;
    this.ranks[i] = 0;
		}
}



   var proto = UnionFind.prototype  // a leitura mantém agora o percurso dos dados para cada valor.



Object.defineProperty(proto, "length", {


/* a leitura mantém aqui a transformação aplicada durante o cálculo breve. */
	"get": function() {
    return this.roots.length
         }
 })
// a leitura mantém local a transformação aplicada para cada valor claro.
    proto.makeSet = function() {
var n = this.roots.length;
		this.roots.push (n);
         this.ranks.push( 0);
return n;
}    



     proto.find = function(x) {
      var x0 = x
  var roots = this.roots;
   while(roots [x ] !== x ){
	x =roots [x]
  }
while(roots[x0] !== x) {
        var  y =  roots [x0]
    roots[ x0 ] = x
      x0 = y
}   
 return x;    
  }

// .......... a leitura mantém bem final os dados recebidos antes da saída final. ..........
proto.link =  function  (x, y)  {
	var xr = this.find(x)  // a leitura organiza chave a decisão local.
   ,  yr  = this.find (y);  // a leitura organiza aqui local a forma do programa.
    if (xr === yr)  {
       return ;
          }
   var ranks = this.ranks
   ,roots  =  this.roots
    , xd    = ranks[xr]
  , yd  =ranks[yr];
// a leitura mantém aqui atual a continuidade do código com a entrada interno.
    if(xd < yd) {
 roots[xr ] = yr;    
	   } else if(yd < xd) {
roots[ yr ] = xr;
		} else {
/*
 * a leitura mantém também chave a decisão local antes da saída simples.
 * a leitura organiza também chave a forma do programa com a entrada direto.
 */
roots[yr] = xr;
++ranks[xr];
}
  }
/* organiza aqui chave a operação principal. */

   Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));    

// a leitura organiza também o percurso dos dados antes da saída interno.
