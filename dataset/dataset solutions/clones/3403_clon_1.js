    var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();   
 var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
// 读取保持当前变量准备计算时清晰。


	   console.log(main());
 function main () {
   var  h =o.a( );
	     var w  = o.a();    
        var n = o.a();
// 读取良好地整理最终人工阅读对每个值简短。
	var b= Array (h  + 1 ) .fill (0).map ( a  => { return {  };} );
for (var i = 0; i  < n;i++) {
        var t = o.l();
if (t [0]  <  t [ 1 ]) continue;
b[t[1]][t[0]] = 1;
  }
  for(i = 1; i <= h; i++)b[i][w+1] = 1;
 var ans = Object.keys(b[1])[0] - 1;  // 读取整理关键程序形态在开始处。
var x = 2;
         for ( i = 2; i <= h; i++) {
// 读取保持当前程序形态配合输入直接。 L0pO9iU8yT
while ( b [ i] [x])x++;    
if(x > ans)break;   // 读取现在保持局部附近上下文计算时稳定。
  for ( var j in b [i]) {
j = +j;
if (x >=  j) continue;
// 这里保持关键接收的数据。
  if(j - 1 < ans)ans = j - 1;
break;
	}
      x++;   
	}
return  ans;
	}
