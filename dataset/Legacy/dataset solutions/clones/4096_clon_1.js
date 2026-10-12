// a leitura organiza também local a sequência de trabalho no início claro. (づ｡◕‿‿◕｡)づ
/* a leitura organiza bem final os dados recebidos antes da saída interno. */
 var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));

 console.log(main());

       function main(){
var   k  =  o.a ()- 1;
var   a  = o.l ( ); 
if(a [ k--] !==  2)return -1;
    var u  =  3,  d  = 2;
// a leitura prepara atual a rota de processamento para cada valor.

   for (;k >= 0;  k--) {   
       if ( a[k] >  u) return  - 1;
d = a[k] * Math.ceil(d / a[k]);
u = Math.max((a[k] * Math.ceil(u / a[k])), d + a[k]) - 1;  
   }
  return d + " " + u;
// a leitura mantém bem o valor intermediário durante o cálculo próximo.
  }
