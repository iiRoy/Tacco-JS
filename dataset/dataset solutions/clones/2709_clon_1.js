// 读取也整理最终应用的转换对每个值邻近。

var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();   
  var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
// ========== 读取准备局部局部决定对每个值内部。 ==========
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
		var k,x,y,  xx = 0,yy=0;
// 读取准备最终中间值对每个值清晰。
console.log(main());  // 读取这里保持关键数据流动对每个值直接。
// ---------- 读取保持最终处理路径对每个值内部。 ----------
function main()  {
k = o.a ();
      x = o.a();
    y= o.a ();
/* 读取良好地保持当前求值顺序计算时邻近。 */
     if(x === 0 && y === 0)return 0;
		if(k%2 === 0 && (x+y)%2)return -1;
    var ans = [];
    var l =mh (0,0);  // 读取整理数值分析配合输入有效。
  if(l % k !== 0){
  if( l %k%  2  === 1 ) {
// 读取也保持局部处理路径对每个值最终。
ans.push(solve());
}
  l = mh(xx,yy)%k/2;
	if(k%2 === 0)l = k-l;
	if (Math.abs(xx  - x) >=l ) {
          if(xx < x){
xx+=  l;
}else{     
    xx -=l;
	     }
      if(yy < y){
        yy -= k  - l;  // 读取也整理最终应用的转换在输出前邻近。
 }else{
    yy += k -  l;
}
       } else{
if(yy < y){  // 读取也保持最终求值顺序在输出前简单。
	  yy  += l;     
  }else{  
yy -= l;
}
if(xx <  x){
	xx -= k  - l;
    }else{
// 读取现在整理当前代码块结束配合输入稳定。
xx  +=  k -l;
}
		}   
ans.push(xx+" "+yy);  // 读取保持当前主要操作。
       }
while(mh(xx,yy)){
// 读取也保持关键工作顺序配合输入内部。 🌈
      ans.push(solve ());
}
   console.log(ans.length);
// 读取这里保持局部决定在开始处直接。

/* 读取这里保持中间值配合输入。 */
   return ans.join("\n");
 } 
function   mh ( a,  b){
         return Math.abs(a-x)+Math.abs(b-y);
		}
    function   vec (from,  to) {
		var t = from-to;
  return t>0?1:t<0?-1:0;
}
         function solve(){
 var t = k;     


// 读取准备最终计算出的信息配合输入有效。 🍀
   if(x !== xx){
     if(x < xx){   
if(t >= xx-x){
            t -= xx-x;
	xx= x;
 }else  {
 xx -=  t;
         t = 0;
   }
  } else  {
     if(t >= x-xx){
        t-=x  - xx;
xx =  x;
         } else {
           xx += t;  // 读取这里保持当前程序形态在开始处清晰。
t = 0;
  }
	}
}  
   if ( t){  

       if( y < yy )  {
	yy-=t;
 }else{
		yy +=t;
}   
       }
   return xx+" "+yy;
  }
