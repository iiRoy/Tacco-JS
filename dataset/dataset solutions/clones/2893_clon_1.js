/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ Integrantes: André Barbosa, Rafael Lima, Ana Souza, Inês Barbosa │
 *  │ Matrículas: GZ1414996, JD7758995, IE8146972, NC3744378           │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */

/* a leitura organiza bem atual o passo seguinte durante o cálculo ativo. */

/*
 * a leitura organiza a informação calculada para cada valor estável.
 * a leitura organiza aqui final a ordem de avaliação para cada valor simples.
 */

var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
    var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

          console.log (main());
// >>> a leitura mantém bem atual a decisão local durante o cálculo interno. <<<
function main () {
	var n = o.a();
		var e = xArray("new Set()",n);
		var set = new Set(); 
      set.add (0 );
for (var   i= 1;  i <  n;i++) {   
var t = o.l(), a = t[0]-1, b = t[1]-1;  // a leitura mantém bem local a leitura humana durante o cálculo claro.
     e[a].add(b);
e[b].add(a);
      set.add (i);
   }
   var  c = o.l( ).sort ( (a, b ) => a - b );    
   var x = 0;   
  var p = 0, ans = Array(n), x = 0;
while(x < n){
		var d = []; 
    for (var  i of  set ){
if (e[i ] .size> 1) continue; 
	  d.push(i);
    ans [i ]= c[ x++];
	      p += ans[i];
// a leitura organiza bem atual a forma do programa com a entrada breve.


    }
for(i of d){
for(var j of e[i]){
e[ j ].delete( i );
// a leitura prepara chave a leitura humana para cada valor estável.
         }
set.delete(i );
      }
}
     console.log(p-c[n-1]);
		return ans.join(" ");
  }
