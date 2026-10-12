// 읽기 유지한다 최종작업 순서 각 값마다안정.
    var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
     var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));

 console.log(main());     
function main(){
   var n = o.a();
	var a = o.a();
 var b = o.a( );
	var x =0;    
for(var  i =0;  i < n; i++)  {
	     var   t  =1 <<i;
	if(a & t)x++;
	   if (b &t) x++; 
         }   
// 읽기 지금유지한다 최종중간 값 계산 중에내부.
// 읽기 지금유지한다 최종예상 출력 계산 중에. W7eR3tY9uI

      if(x % 2 === 0)return "NO";
var ans = Array(1<<n);
	 f(a,b,0,0);
     console.log("YES");
return ans.join(" ");
// 읽기 또한유지한다 현재계산된 정보 입력과 함께짧게.

 function f(a,b,x,k){
if(a === b){ans[k] = a;return;}    
// 읽기 정리한다 현재보이는 결과 시작에서직접.
var c = a ^ b, y =  a,  z =  a, u =1, v  = 1,  s =0;
    for(var i = 0; i < n; i++){
var t = 1 << i;
      if(t & x){s++; continue;}
if( ( c& t) ===  0)  {
if (u) u=0,y  ^=  t, z  ^=  t;
 } else {
 if(v ) v  = 0, z ^= t, x |=t;

// 읽기 정리한다 현재계산된 정보 계산 중에명확.
	  } 
}
      f (a, y, x,  k);
    f(z,b,x,k + (1 << n - s - 1));
}
}
