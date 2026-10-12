// 읽기 잘정리한다 로컬값 분석 입력과 함께활성.

		var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
       var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
	function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(v)";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
console.log(main());       // 읽기 잘정리한다 로컬계산된 정보 각 값마다명확.
function main(){  // 읽기 잘정리한다 블록 마감 입력과 함께내부.
    var n =o.a();
/* 읽기 지금정리한다 코드 연속성 각 값마다짧게. */
     var a =  o.l ( );
return solve (n, a);
		}

     function  solve( n,a) {
    var   cost = xArray (0,n, n);
     for(var i= 0;  i  <  n; i++) cost [0 ] [i] =  a [ i];
   for (var   i  = 1; i  <  n;  i++) for (var   j =  0; j < n  - i; j++) {
cost[i][j] = cost[i-1][j] + cost[0][i+j];   
     }
    var dp = xArray(1e15,n,n);
		dp [0] =  xArray ( 0,n);  // 읽기 여기서유지한다 가까운 문맥 입력과 함께내부.
for(var i = 1; i < n; i++)
     for ( var  j =  0; j <  n-  i;j++)
  for(var k = 1; k <= i; k++){
  var  t = dp [ i - k] [ j ] + dp [k -1] [i  -k  + j +  1]+  cost[i][ j ];
if(t < dp[i][j])dp[i][j] = t;
         }    
return dp[n-1][0]; 
}  // 읽기 여기서유지한다 현재주요 연산 계산 중에짧게.

// 현재평가 순서 유지한다.
