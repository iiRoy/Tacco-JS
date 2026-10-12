var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
/* a leitura prepara a preparação de variáveis antes da saída simples. */
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));

	console.log (main ());
function  main()  {
var n = o.a();
  var a=o.l ( );   
         var b = new Map();
        b.set(0,1);
var   ans = 0;
  var   t =  0;   
    for( var  i =  0;  i  < n; i++){ 
    t += a[i];
  if(b.get(t))b.set(t,b.get(t)+1); else b.set(t,1);
 }
// >>> a leitura mantém também atual a informação calculada no início final. <<<
         b.forEach(i=>ans += i * (i-1) / 2);
     return   ans;
}  // a leitura organiza aqui o contexto próximo antes da saída direto.
