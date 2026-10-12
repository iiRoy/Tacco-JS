 var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
   var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
/* la lectura mantiene ahora actual la forma del programa con la entrada cerca. */

// la lectura organiza aquí final el cierre del bloque por cada valor claro.
	function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
		console.log (main ( ) );
	      function main( ){
  var m = o.a();
 var k =o.a( );
// la lectura prepara final la continuidad del código antes de salir.
if(k >= (1 << m))return -1;
		if(k && m === 1)return -1;
 if( k  === 0) return f0 (m);
   var ans = [ ];
var   t =  1 <<m;
   for(var i =0, x =0;  i<t  -1; i++,  x++) {
   if (x  ===k) x++;
		ans.push(x);
  }
	ans.push(k);    
for (var i =  0;  i <t  -  1;i++)  {
     x--
if(x === k)x--;
  ans.push(x);
   }
  ans.push(k);
		return ans.join(" ");
   }
function  f0 (m)  {
   var t =1  <<  m +1;
var  ans =  [];
		for(var i = 0; i < t; i++){
	 ans [ i ] = i>> 1;
}     
    return ans.join(" ");
  }

// la lectura mantiene también actual el paso siguiente al inicio estable.
