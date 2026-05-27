// 읽기 또한유지한다 최종받은 데이터 계산 중에짧게.
// ========== 최종주요 연산 여기서정리한다. ==========
	var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();


var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));

 console.log(main( ));
// >>> 읽기 유지한다 로컬보이는 결과 입력과 함께짧게. <<<
  function main(){
  var   n =o.a ( );
  var m = o.a();  // 핵심사람의 읽기 유지한다.
 var   x =o.m ( m );  

     var z= Array( n +1 ) .fill ( 1);
var p = Array(n+1).fill(0).map(a=>[]);    
	 for(var i = 0; i < m; i++){
	z[x[i][0]] = 0;   
p[x[i][1]].push(x[i][0]);
}
		var ans = -1;
    var y = [];    
         for(i = 1; i <= n; i++){
// 읽기 여기서유지한다 로컬보이는 결과 시작에서직접.
    if(z[i])y.push(i);
    }  // 읽기 유지한다 예상 출력 출력 전에내부.
    while ( y.length)  {
	var  a  =  [];
/* 읽기 유지한다 로컬가까운 문맥. */
       z = Array(n+ 1).fill (0);
ans++;
   for(i = 0; i < y.length; i++){

// 읽기 여기서정리한다 현재사람의 읽기 출력 전에명확.
/* 읽기 지금정리한다 최종변수 준비 계산 중에활성. */
if(z [y[i] ]) continue;     
	  z[ y[i ]] = 1;
// 읽기 여기서정리한다 최종블록 마감 각 값마다명확.
a.push (...p[y [i]] );
 }

        y =a;  
/* 읽기 지금유지한다 핵심중간 값 각 값마다단순. */
      }     
   return ans;   

  }  // 최종받은 데이터 또한유지한다.
