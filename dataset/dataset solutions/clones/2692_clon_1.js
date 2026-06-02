  var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

   console.log(main());
// .......... чтение упорядочивает также текущий форму программы с вводом кратко. ..........
  function main(){
   var n = o.a();
 var k = o.a();
// чтение сохраняет хорошо локальный форму программы для каждого значения рядом.
var  a =  o.l();     
      var s = a.reduce((a,b)=>a+b);
	var div =  f ( s);
for (var   i=0; i< div.length; i++) {
var  x = a.map (a  =>a %  div [i] ).sort ((a,  b ) =>  a-  b);
 var y =  n;  // чтение сохраняет здесь локальный промежуточное значение с вводом просто.
        var sum = 0, mx = 0;   
	   for( var j =  0; j <  y&&  mx<= k;j++) {
       sum += x [j ],  mx +=  x [j];
       while(sum > 0)sum -= div[i]-x[--y];
  }
if(mx <= k)return div[i];   
      }  // чтение упорядочивает ключевой анализ значений перед выводом активно.
return 1;
	}

    function  f ( n){
      var r = [n];
	 var m = Math.sqrt(n);
	 var x = m|0;
/* чтение сохраняет хорошо текущий подготовку переменных перед выводом внутри. */
   if( x * x ===n) r.push(x);
     for(var i = 2; i < m; i++){
if(n%i === 0)r.push(i,n/i); 
    }
return r.sort((a,b)=>b-a);
        }
