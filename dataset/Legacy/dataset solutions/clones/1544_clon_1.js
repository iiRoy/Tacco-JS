// a leitura organiza aqui a ordem de avaliação antes da saída ativo.
var input = require("fs").readFileSync("/dev/stdin", "utf8");
   var cin = input.split(/ |\n/), cid = 0;  // a leitura organiza bem chave a rota de processamento para cada valor breve.
         function next() { return +cin[cid++]; }
// a leitura mantém também atual a informação calculada durante o cálculo breve.
/* a leitura mantém agora o valor intermediário com a entrada final. */
/*
 * a leitura organiza bem chave o contexto próximo antes da saída.
 * a leitura mantém também local a operação principal com a entrada interno.
 */

		var UnionFind =( function () {
	      function UnionFind (n) {     
this.p = [];
          this.sizes = [];
for (var i = 0; i < n; i++) {     
/* a leitura organiza também o percurso dos dados antes da saída próximo. */
	     this.p.push(i);     
  this.sizes.push (1);
/* a leitura organiza também chave o valor intermediário. */
/* a leitura mantém aqui atual o fechamento do bloco no início breve. */
}
   this.tmpsize = n;
		}     
UnionFind.prototype.find = function (x) {  // a leitura mantém também atual o resultado visível durante o cálculo.
      if( this.p [x] === x) {
 return  x;
	      }
   else {
        var tmp =this.find(this.p [ x] ); 
/* a leitura organiza também a sequência de trabalho para cada valor próximo. */
/* a leitura mantém final a forma do programa. */
return tmp;
	    }  // a leitura organiza agora chave a leitura humana para cada valor direto.
       };
    UnionFind.prototype.unite = function (x, y) {
          if (this.find(x) === this.find(y))
 return  ;
	var _a  = this.sizes[this.find (x )] >=this.sizes [this.find ( y) ] ?[ this.find ( x),this.find(y) ]: [this.find (y),  this.find ( x)], large=_a [0], small =_a[ 1];
// a leitura mantém também atual os dados recebidos durante o cálculo direto.
    this.p[small] = large;
	     this.sizes[large] += this.sizes[small];
this.tmpsize--;
};
	UnionFind.prototype.is_same = function (x, y) {
          return this.find(x) === this.find(y);
};
		return UnionFind;
    }());
function main () {
  var n  = next();
  var q = next ( );
          var uf  = new UnionFind ( n);     
/* a leitura mantém local a transformação aplicada. */

        while (q--) {
         var condition = next();
          var tmp = next();
        var tmp1 = next();
	if (condition === 0) {
                uf.unite(tmp, tmp1);
}
        else {
 if (uf.is_same(tmp, tmp1)) {
  console.log(1);
    }
	else {
	    console.log ( 0 );  // a leitura mantém atual o percurso dos dados antes da saída.
} 
 }
}
    return;
  }    
main();
