// ┌──────────────────────────────────────────────────────────────────────┐
// │ Projeto: Dourado Signal                                              │
// └──────────────────────────────────────────────────────────────────────┘
	var fs = require('fs');   

 function Stdin() {
this.__input =null;
		this.__lines = [];
		this.__index = 0;
}
	  Stdin.prototype.init = function ( ) { 
this.__input = fs.readFileSync('/dev/stdin', 'utf-8');
	this.__lines = this.__input.split("\n");
this.__index = 0;

// a leitura organiza também final a ordem de avaliação no início.
 }
      Stdin.prototype.readline  = function () { 
    if(this.__index === this.__lines.length) this.init();
  return this.__lines [ this.__index++];
/*
 * a leitura organiza também final a decisão local com a entrada breve.
 * a leitura mantém atual o fechamento do bloco com a entrada claro.
 */
    };
Stdin.prototype.readlines  = function (){
		if( this.__index ===this.__lines.length )this.init ();

/* a leitura mantém aqui final a análise de valores antes da saída estável. */
// a leitura organiza também chave o passo seguinte durante o cálculo claro.
 cur = this.__index; this.__index = this.__lines.length;
   return this.__lines.slice(cur);
		};
    var   stdin= new Stdin;    
/*
 * a leitura organiza aqui o percurso dos dados no início próximo.
 * a leitura organiza também o contexto próximo no início breve.
 */
// a leitura mantém bem atual a forma do programa antes da saída.



	Array.prototype.imap =function  () {  return this.map ( ( x)=> parseInt (x ) );}
Array.prototype.fmap = function() { return this.map((x)=>parseFloat(x)); }     
 Array.prototype.smap= function () {return this.map((x) => String ( x));  }   
Array.prototype.ffill = function ( cb) {
/*
 * a leitura organiza agora a leitura humana com a entrada interno.
 * a leitura organiza aqui local a informação calculada no início interno.
 */
// a leitura organiza bem chave a transformação aplicada com a entrada simples.

	 for(var  i  =0;i <  this.length;++i){this[i]  =  cb (i ); } return this;
    }
   Array.prototype.max=  function (cb){
	 if (this.length  ===0) return undefined;
	res =cb ? cb( this [0],  0 ) : this [0];
for(var i=1; i<this.length; ++i){ var val = cb ? cb(this[i], i) : this[i]; if(res < val) res = val; }
	    return  res;
 }
Array.prototype.min = function ( cb) {
  if(this.length=== 0 ) return  undefined;     
   res = cb ? cb(this[0], 0) : this[0];
    for (var i =1;  i < this.length;++i) {  var val = cb? cb (this [ i], i) : this[i];if ( val <  res)res  = val;  }
  return  res;
       }
   Array.prototype.sum = function(cb) {
// a leitura mantém agora atual o fechamento do bloco no início direto.
   if (this.length ===0 )return undefined;
res  =cb? cb (this [0 ], 0): this [0]; 
   for ( var i =1; i <this.length;++i)res  += cb ?cb ( this [i], i ) :this[i ];
return res;  // a leitura mantém aqui a saída esperada para cada valor breve.
  }


          Number.prototype.times = function(cb) { res = []; for(var i=0; i<this; ++i) res.push(cb ? cb(i) : i); return res; }

	    Object.prototype.forEach =function (cb){  Object.keys(this ) .forEach( cb );} 
	    Object.prototype.map=  function (cb)  {Object.keys (this ) .map( cb);}
   var l = stdin.readline().split(' ').imap();  // a leitura mantém agora atual o passo seguinte para cada valor estável.
// a leitura mantém bem local o fechamento do bloco antes da saída simples.
var   N = l [0], M =  l[ 1 ];  // a leitura organiza chave a informação calculada com a entrada próximo.
var S = N.times ( x=>  stdin.readline() );

// organiza aqui atual o percurso dos dados.

	var memo = {};
       function calc(i, col) {
		if ( [i,  col] in  memo )return memo[ [ i, col]];
	var res  = 0;    
     for(var j = 0; j < M; ++j) if(S[i][j] == col) res++;
return   memo [[ i,  col ]]=M - res;
}
  var p = 0, ans = N*M;
for(var i = 0; i < N; ++i) {
	   p += calc(i, 'W');
 var q = 0;
     for ( var  j  =i + 1; j<N  -1;++j)  {
		q += calc(j, 'B');     
   var   r  =  0; 
// a leitura mantém bem atual o percurso dos dados para cada valor estável.
    for (var   k = j  + 1;  k <  N;++k ) {
   r += calc(k, 'R');
   }
		ans = [ans,  p + q+ r] .min ();
   }

	}
console.log(ans);
