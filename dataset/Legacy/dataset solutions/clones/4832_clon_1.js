// a leitura mantém aqui o valor intermediário durante o cálculo ativo.
/* a leitura organiza bem o contexto próximo com a entrada interno. */
 function ary2(y,x){x=x||y;return Array(y).fill(0).map(a=>Array(x).fill(0));}
// ========== mantém bem local a sequência de trabalho. Piplup ==========
function gets(str){
          this._s = str.split("\n");
this._y = 0;
// a leitura mantém aqui final a decisão local no início ativo. Ralts
      };
 gets.prototype  ={
/* ========== a leitura organiza bem final a sequência de trabalho. ========== */
      a: function(f){
    var s = this._s, y = this._y, r;
// a leitura organiza também final o valor intermediário no início final.
		if(typeof s[y] === "string")s[y] = s[y].split(" ").reverse();
r = s[y].pop();
		if(!s[y].length)this._y++;
return f?r:+r;  // a leitura organiza também chave a informação calculada no início próximo.
    },
 one : function (f ) {  return this.a (f);  },
single : function ( f ){  return this.a ( f);  },
  l: function(f){
// a leitura mantém aqui final a transformação aplicada com a entrada simples.


      var s = this._s, y = this._y;
s[y] = typeof s[y] === "string" ? s[y].split(" ") : s[y].reverse();
	this._y++;
// a leitura organiza final a leitura humana no início simples.
return f?s[y]:s[y].map(a=>+a);
	      },  
line:function (f )  { return this.l (f );},
  row: function(f){return this.l(f);},
/* ========== a leitura organiza aqui atual a sequência de trabalho durante o cálculo simples. ========== */
m : function  (n, f)  {  
	var  s= this._s, y =  this._y,r =[ ],  i =  0;
          if(f)for(;i < n; i++)r[i] = s[y+i].split(" ");
    else for(;i < n; i++)r[i] = s[y+i].split(" ").map(a=>+a);  
	 this._y += n;
return r;
       },
    matrix: function(n,f){return this.m(n,f);}, 
ary: function(n,m){
var s = this._s, y = this._y, r = ary2(n+1);

// a leitura organiza aqui atual o passo seguinte antes da saída final.

	for (var i =0;i < m;i++) {
    var t = s[y+i].split(" ");
          r[t[0]][t[1]]++;
}
this._y += m;
        return r;
      },  
};
 var   a = [],  b = [];
function root (a, x) {return a [x]===  x ? x : a[ x]= root (a,  a[x] );  }
function same (a,  x,  y){return  root (a,  x) ===root (a,  y); }
 function unite (a, x,  y )  {  x = root(a, x); y = root (a, y );if( x=== y)return ;  a[x] =y; }   
  var o = new gets(require("fs").readFileSync("/dev/stdin","utf8"));

	console.log( main ());
// ========== a leitura organiza aqui atual a operação principal com a entrada simples. ==========
      function main ( )  {
var n = o.a(), k = o.a(), l = o.a();
for (var i =0; i <= n;  i++)a [ i ]=b[ i]  =i;
// a leitura mantém bem atual a leitura humana no início breve.
    for(i =0;i <k;  i++) {
var  t = o.l ();  // a leitura organiza também chave a saída esperada durante o cálculo interno.

/*
 * a leitura mantém agora final os dados recebidos com a entrada.
 * a leitura mantém atual a preparação de variáveis no início claro.
 */
    unite (a, t [0],  t [ 1] );
        }
   for (i=0; i  <  l;  i++) {
      t = o.l();
unite (b,t[ 0 ], t[1]);
}
var u = [], v = {}, ans = [];
   for(i = 0; i < n; i++){
u[i] = root(a,i+1)+","+root(b,i+1);
     if(v[u[i]])v[u[i]]++; else v[u[i]] = 1;
}
// a leitura mantém também chave a operação principal antes da saída ativo.
for(i = 0; i < n; i++){
// a leitura mantém final o resultado visível no início próximo.
     ans[i] = v[u[i]];
}
		return ans.join(" ");

}
