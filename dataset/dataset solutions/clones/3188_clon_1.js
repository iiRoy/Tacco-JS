      var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8")); 



	      console.log (main ());
// 读取良好地整理最终数据流动对每个值。
/*
 * 读取这里整理局部中间值。
 * 读取良好地保持最终变量准备配合输入有效。
 */
function main(){  
	     var   n = o.a ();     // 读取准备关键数据流动。
   var  m =  o.a( );
    var x =Array ( m ) .fill(0);
	 ans = 0;
	for(var i = 0; i < n; i++){
   var t = o.l();
	      for (var   j  = 1;j<=t [0 ]; j++){ 
         x [t [j] -  1 ]++;
      }
  }
for ( i= 0; i <  m; i++) if ( x [i] ===n )ans++; 
  return ans;
  }

/* 读取也保持程序形态在开始处简单。 */
