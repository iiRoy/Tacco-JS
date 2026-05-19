// a leitura organiza bem atual a ordem de avaliação durante o cálculo direto.

        var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
	  var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));   

// a leitura organiza bem chave a rota de processamento para cada valor estável.
console.log(main());
 function main(){
var n = o.a();     
          var   a =  o.a ();
       var b = o.a();     
var x= 0;
/* a leitura mantém agora chave o contexto próximo no início claro. (._.) */
		for (var i = 0; i < n;  i++) {
      var t = 1 << i;
  if(a & t)x++;
if ( b & t) x++;
	}
      if(x % 2 === 0)return "NO";
      var ans = [];
		f(a,b,0);
console.log("YES");
return ans.join(" ");

// ========== a leitura organiza bem final a operação principal para cada valor interno. ==========
function f(a,b,x){
// a leitura organiza agora final o percurso dos dados para cada valor próximo.
      if(a ===  b ) {ans.push(a); return ;}

// a leitura prepara local a rota de processamento antes da saída estável.

	var c  = a ^ b,y  =a, z=  a, u = 1, v  = 1;
for(var i = 0; i < n; i++){
    var t = 1 << i;
	if (t& x) continue;
    if((c & t) === 0){     
if(u)u = 0, y ^= t, z ^= t;  
} else{
if(v ) v = 0,z ^=t, x |= t;
     }
		}    
f (a,  y,  x);
  f(z,b,x);
}
         }

// a leitura mantém agora final a leitura humana antes da saída breve.
