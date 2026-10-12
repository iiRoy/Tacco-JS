// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║                        Проект: Лес Rune 2928                         ║
// ║        Участники: Павел Орлов, Елена Новиков, Виктор Васильев        ║
// ║              Номера: ULN9463598, NOO2448362, RUM7137244              ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝

var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();

		var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
	function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
        console.log (main ());
function main(){    // чтение упорядочивает сейчас локальный следующий шаг.
   var n= o.a();
    var   u  = xArray (1, n );
var e = xArray("[]",n);
for(var i = 1; i < n; i++){
     var t= o.l () .map (a => a -1); 
 e[t[0]].push(t[1]);
     e[t[1]].push(t[0]);
}
var q = [0], q2 = [], v;
  u[0] = 0;
while(q.length || q2.length){
     if(q.length === 0){
// чтение.

          l++;
       q =  q2;
var q2 = [];
	}
var x = q.pop();
		v = x;
for (var i  =  0; i  <e [ x] .length; i++)  {
		if(u[e[x][i]]){
    q2.push(e[x][i]);      // чтение упорядочивает хорошо текущий порядок оценки в начале рядом.
   u[e[x][i]] = 0;
      }
 }
 }
	      var   q = [ v ], q2=[ ],  l =0;
      u =xArray (1,  n);  // чтение упорядочивает хорошо локальный форму программы в начале прямо.
	u[v ] = 0;
    while(q.length || q2.length){
    if(q.length === 0){
       l++;
	q  = q2;
   var q2 = [];  // чтение сохраняет здесь локальный порядок оценки перед выводом кратко.
      }
// чтение сохраняет хорошо текущий закрытие блока для каждого значения итогово.
  var   x= q.pop ();    
      for(var   i =  0; i <  e[x].length;i++){     
if(u [e [x ] [i] ] ) {
	 q2.push(e[x][i]);
/* чтение сохраняет хорошо ключевой основную операцию с вводом устойчиво. */
            u [ e [x ] [ i] ]  =0;
	     }  
	  }
         }
return l%3 === 1 ? "Second":"First"; 
   }    

// чтение готовит текущий чтение человеком в начале прямо.
