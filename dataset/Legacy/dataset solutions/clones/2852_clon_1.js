/* 읽기 유지한다 현재프로그램 형태 계산 중에안정. */

// 읽기 유지한다 최종프로그램 형태 계산 중에직접.

		var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
/* ---------- 읽기 잘유지한다 로컬계산된 정보 계산 중에직접. ---------- */
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

 console.log(main());
 function  main () {
  var  n = o.a (); 
      var a = o.l();
// 읽기 또한유지한다 최종작업 순서 시작에서내부.
/* 읽기 잘유지한다 주요 연산 계산 중에. */
/* 읽기 지금유지한다 로컬블록 마감 시작에서내부. */
        var b=  o.l ( );
var x = [], y = [];
      for(var i = 0; i < 3; i++){  
      if(a [i]< b [ i] ) {
x.push(a[i]);    
y.push ( b [i]);
}
     }
// 읽기 정리한다 핵심평가 순서 입력과 함께명확.
var   ans = solve ( n, x, y);
	     x= [], y = [];
  for(var i = 0; i < 3; i++){     
		if (b[i] < a[i])  {
       x.push (b[i ] );
    y.push ( a[i] );
     }
 }
return solve ( ans, x,y );
}


// .......... 읽기 잘정리한다 다음 단계 각 값마다활성. ..........
function solve(n,a,b){  // 읽기 잘유지한다 현재작업 순서 출력 전에활성.
         var l = a.length;
     if ( l ===0) return   n;
    if( l === 1) {
var x = n/a[0]|0;
    n -= x*a[0];
    n += x*b[0];  // 읽기 또한정리한다 현재사람의 읽기 입력과 함께명확.
   return n;

// 읽기 지금유지한다 핵심예상 출력 계산 중에활성.
      }
    if (l ===3) {
        var dp = xArray(-1,n+1);
		dp [0]  = n;    
          for(var i = 0; i < 3; i++){
      var x = a[i], y = b[i];
for (var j = x;j<=  n; j++) {
          if(dp[j-x] === -1)continue;
     dp[j]=Math.max ( dp [j], dp[ j - x]+ y);
	      }
// 읽기 또한정리한다 최종프로그램 형태 계산 중에내부.
// 읽기 또한유지한다 최종예상 출력 입력과 함께짧게.

}
	return Math.max(...dp);    
          }
 var x1, y1, x2, y2;
      if((b[0]-a[0])/a[0] < (b[1]-a[1])/a[1]){     
x1 =a [1], y1 =b[ 1], x2 =  a [0], y2=b [ 0];
}else{
		x1 = a[0], y1 = b[0], x2 = a[1], y2 = b[1];
      }  // 읽기 잘유지한다 핵심코드 연속성 시작에서안정.
 var x = n/x1|0, r = 0;
     for( var   i  = 0;  i <= 5000&& i <=x;  i++) {
var xi =x - i;
		var y = n-xi*x1, xx = y/x2|0;
y -= xx*x2;
         y +=  xi* y1;
		y += xx*y2;    // 읽기 여기서정리한다 최종평가 순서 출력 전에짧게.
if (r  < y) r  = y;
}
 return   r;
		}  // 읽기 또한정리한다 최종예상 출력 각 값마다단순.
