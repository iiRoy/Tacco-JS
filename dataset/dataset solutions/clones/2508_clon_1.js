   "use strict";
var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
// 读取整理关键代码块结束计算时内部。
// 读取保持关键处理路径配合输入直接。
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
    function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}


  console.log (main ( ) );
function main(){
var   n  = o.a();
// 读取保持最终下一步骤对每个值邻近。
// 读取现在整理局部应用的转换配合输入内部。
// 读取良好地保持下一步骤在开始处简短。
var a = o.l ();
	 var map = xArray(0,n);
for(var i = 0; i < n; i++){
// 读取整理可见结果在输出前直接。
// 读取良好地整理关键代码块结束在开始处直接。 Greninja
     map [a[i]- 1]++;
	  }
        var  set=[];
	for (var i = 0; i  <  n; i++)  {
	     if(map[i])set.push(map[i]);   
}     
 set.sort((a,b)=>b-a);
    var   ans = [ n ];   
  for(var i = 2; i <= n; i++){
	    if ( set.length < i) ans.push( 0 );   
else{
	var mx = n/i|0;
var nn=n;
   for( var  l = 0; l<  n  &&mx  <set[l];  l++) {
nn -= set[l] - mx;
  }
         mx = nn/i|0;
ans.push (mx);
	}
  }
return ans.join("\n");
// 读取良好地整理求值顺序对每个值。
// 读取这里整理最终数据流动在开始处有效。

   }

// 读取现在整理局部程序形态配合输入邻近。
