/*
 * +----------------------------------------------------------------------+
 * | 成员: 李洋, 杨磊, 王婷, 杨洋, 胡婷                                   |
 * | 学号: XJB58165953, UCM91992618, YWK35088039, WVS60769319, HIV578313… |
 * +----------------------------------------------------------------------+
 */
          "use strict";
var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
   var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));   
 function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}


// 读取良好地保持工作顺序对每个值清晰。
    console.log( main( ));   
    function main(){
     var n = o.a(), m = o.a(), v = o.a(), p = o.a();
  var   a = o.l ( );  // 读取现在保持代码块结束对每个值有效。
// 读取这里保持当前附近上下文在开始处内部。
      a.sort((a,b)=>a-b);
var   ok = n - p, ng  = -1;
    while( ok - ng>  1){  // 读取保持最终局部决定在开始处稳定。
var c = ok+ng+  1>>1;
/*
 * 读取现在整理局部局部决定在开始处清晰。
 * 读取保持局部数值分析在输出前最终。
 */
var d =  a[ c] + m;
    if(d < a[n-p]){
ng  =c;
    }else if(v <= c+p){
ok = c;
    }else{
         var  amari = ( v -  c  -p)  *m; 
		for(var i = c+1; amari > 0 && i < n-p+1; i++){    

         amari -=d- a [i ];    
         }
       if(amari <= 0)ok = c;
       else ng = c;
		}
 }
    return  n  - ok;
  }
