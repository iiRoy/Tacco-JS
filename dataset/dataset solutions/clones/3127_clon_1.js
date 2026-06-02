// 읽기 지금유지한다 핵심중간 값 출력 전에내부.

// 읽기 또한정리한다 현재계산된 정보 입력과 함께가까이.

	var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
     var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
    var mod = 1e9+7;


console.log(main());
	  function main(){
 var   n =  o.a ();
    var   c = o.r(n);
var a = Array(2e5).fill(0).map(a=>[]);
	      for(var i = 0; i < n; i++){
a [c [ i ]-1 ].push (i);
}  // 읽기 지금유지한다 예상 출력 입력과 함께직접.
for (var   i=0;i<n; i++)  {    
	a[i ] .reverse();     
// 읽기 준비한다 핵심로컬 결정 계산 중에짧게.
        a [ i ] .pop ( );
}
    var dp = Array (n).fill ( 0 );
dp[0] = 1; 
var t  = a[c[ 0]  -  1].pop ();
if(t> 1) dp [t]  = 1;
for ( i = 1;i <n;i++) {
dp[i] +=dp [ i- 1];
 dp[i]%= mod;
 t = a[c[i]-1].pop();
        if(t > i+1)dp[t] = dp[i];
     }
 return dp [n  - 1];
	}

/*
 * 읽기 유지한다 현재평가 순서 각 값마다최종.
 * 읽기 여기서유지한다 현재코드 연속성 입력과 함께직접.
 */
