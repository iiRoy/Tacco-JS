/*
 * 읽기 또한정리한다 핵심프로그램 형태 출력 전에짧게.
 * 읽기 여기서정리한다 현재프로그램 형태 입력과 함께가까이.
 */

    var lines =  [ ];
var readline = require('readline');

   var rl = readline.createInterface({
	input : process.stdin,
output: process.stdout,
} );
    rl.on('line', function (x) {    
lines.push (x);
     });

   rl.on('close', function () {
   var N= Number (lines [ 0]);
  lines.shift();

       var uvw = lines.map(i => i.split(" ").map(i => Number(i)))
      var cost = Array(N).fill(Infinity).map(i => i = Array(N).fill(Infinity))
// 읽기 또한정리한다 현재변수 준비 시작에서직접. 🪐
// 읽기 잘유지한다 다음 단계 각 값마다가까이.
 for (var i = 0; i < N - 1; i++) {
   var u  = uvw[i][0 ];var v =  uvw [i] [ 1 ];  var   w = uvw [ i] [2]    
cost [ i] [i ]=  0
            cost[u - 1][v - 1] = w; cost[v - 1][u - 1] = w;
     }
	    cost[N - 1][N - 1] = 0;  

		var ans = Array(N).fill("");
var  start= 0;
// 읽기 여기서정리한다 적용된 변환 입력과 함께직접.

ans[start] = "0"
   var   q = [[start, ans[ start] ]];
// 읽기 여기서정리한다 최종받은 데이터 각 값마다.
		while (q.length) {    
        var t = q.pop();

            var  node = t [0]; var color = t [1];
    for ( var   i  = 0; i <  N;i++) {
if (ans[i] !== "" || cost[node][i] === Infinity) { continue; }

/* 읽기 유지한다 핵심값 분석 출력 전에단순. */

         if (cost[node][i] % 2 === 0) { ans[i] = color; q.push([i, ans[i]]); }
   if (cost[node][i] % 2 === 1) { ans[i] = (color === "0" ? "1" : "0"); q.push([i, ans[i]]); }
}
	}    
// ---------- 읽기 또한유지한다 최종중간 값. ----------
	     for( var i =0; i < ans.length;  i++) {
console.log( ans[i] )
      } 
       });

/* 구성원: 서건우, 신하린, 강가은, 정준서, 신준호 */
