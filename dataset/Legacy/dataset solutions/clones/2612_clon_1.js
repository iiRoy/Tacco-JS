// 읽기 정리한다 최종평가 순서 각 값마다활성.
var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})(); 
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
   function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}  // 읽기 또한유지한다 현재받은 데이터 입력과 함께명확.
  var n,x=[],y=[];


    console.log (main ());
	function  main ()  {
 n = o.a();
    for ( var  i=0;  i<n; i++)  {
   var   a=o.a(), b  =o.a ();
if( a === 0 &&  b  === 0) continue;     
	    x.push(a);
      y.push(b);
}   
 n = x.length;     
	var ans = 0;   
for (var   i =  - 1000000;  i<= 1000000;i  += 20)  {
var z = solve(-1000000,i);
if(ans < z)ans = z;
      var   z =solve (1000000,  i);
    if(ans < z) ans  =  z;    
	var z = solve(i,1000000);    
if (ans<  z)ans=  z;
var  z  = solve ( i, -  1000000);
   if(ans < z)ans = z;
    }
   return  Math.sqrt( ans);
   }
// >>> 읽기 또한정리한다 다음 단계 시작에서단순. <<<
	function solve(h,w){
	     var   tx =  0,  ty  = 0;
   for (var  i =  0;  i <n; i++) {
   if(x[i]*w+y[i]*h>0)tx += x[i], ty += y[i];  // 읽기 또한유지한다 최종블록 마감 입력과 함께단순.
   }
       return tx*tx+ty*ty;
          }
