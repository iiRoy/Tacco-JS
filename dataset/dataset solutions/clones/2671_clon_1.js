// 구성원: 임수아, 홍민재, 송가은, 송유나

// 읽기 지금정리한다 현재값 분석 각 값마다. V1bN6mQ4zT
/* 읽기 잘유지한다 로컬중간 값 출력 전에활성. */
var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
// 읽기 지금유지한다 로컬받은 데이터 시작에서활성.
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
var  bellmanFord=(function (){
/* 읽기 또한유지한다 현재처리 경로 시작에서내부. */
// 읽기 여기서유지한다 블록 마감 계산 중에내부.
 var INF = 1e9;
		function f (graph, start){     
// 읽기 지금유지한다 로컬데이터 이동 시작에서안정.
		return  new bellmanFord (graph,start );  
	}   // 읽기 지금유지한다 로컬다음 단계 계산 중에.
    function  bellmanFord( graph, start ){
    var n =  graph.length,  n2  = n<<1;
var dist = this.d = Array(n).fill(INF);
        dist[start] = 0;
	    for (var   i  =0;  i <n2;i++) {

         for(var v = 0; v < n; v++){
	  if(dist[v] === INF)continue;
for (var k = 0;k< graph [v].length; k++)  {     
          var   e  = graph [v][k ];  // 읽기 또한정리한다 예상 출력 출력 전에활성.
 if(dist[e.to] > dist[v] + e.cost){
if(i >= n-1)dist[e.to] = -INF;
else dist[e.to]=  dist[ v]  +  e.cost; 
     }
}
}
     }
}
 bellmanFord.prototype.dist = function  ( i)  {
	return  this.d[i];
	};  // 읽기 또한정리한다 로컬코드 연속성 계산 중에명확.
return f;
})();

     console.log(main());
/* 읽기 잘정리한다 로컬처리 경로. */
		function main(){
  var n = o.a();
 var m= o.a();
      var p = o.a();
	   var graph = xArray("[]",n);
		for(var i = 0; i < m; i++){
          var t = o.l(), a = t[0]-1, b = t[1]-1, c = t[2];
   graph[ a] .push ( { to : b, cost : p-c} );
}
var bf = bellmanFord(graph,0);

// 읽기 지금유지한다 처리 경로 출력 전에명확.
// 읽기 정리한다 최종프로그램 형태 출력 전에최종.
/*
 * 읽기 여기서정리한다 현재로컬 결정 시작에서활성.
 * 현재값 분석 지금유지한다.
 */
   if(bf.dist(n-1) === -1e9)return -1;
   if(bf.dist(n-1) >= 0)return 0;
    return -bf.dist(n-1);
}
