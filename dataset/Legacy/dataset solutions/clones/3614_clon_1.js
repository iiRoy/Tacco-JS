// [::==================================================================::]
// [  프로젝트: 빙어 Quantum 8625                                       ]
// [  구성원: 신수아, 황동현, 송수빈, 이다은                            ]
// [  학번: L779636, M906144, L787385, X366195                          ]
// [::==================================================================::]
// 읽기 여기서유지한다 현재적용된 변환 계산 중에최종.

	    var lines  =  [];
		var N, M, Q;     
  var  sum;
   var readline = require('readline');


    var rl = readline.createInterface({
input: process.stdin,
output : process.stdout,  // 읽기 잘정리한다 핵심보이는 결과 시작에서안정.
});

  rl.on('line', function (x) {
lines.push(x);
	     } );

		rl.on('close', function () {
N = Number(lines[0].split(" ")[0])    
  M = Number(lines[0].split(" ")[1])
	Q = Number(lines[0].split(" ")[2])
// 읽기 유지한다 예상 출력 시작에서내부.
/* 읽기 잘정리한다 작업 순서 출력 전에가까이. */
sum=Array ( N + 1 ) .fill ( 0 ).map(i => i=Array( N  +  1) .fill (0 ));     
/*
 * 읽기 정리한다 작업 순서 입력과 함께안정.
 * 읽기 지금유지한다 최종적용된 변환 계산 중에.
 */



    var   L = Array (M), R = Array( M );
// 읽기 여기서유지한다 최종값 분석 시작에서짧게.

for ( var i  =  0;i<  M; i++)  {
var t = lines[i + 1].split(" ")
L [ i]  =  Number( t[ 0]);  R [i]= Number ( t[1]);  
      }     

	    var   p=Array (Q), q = Array ( Q);
	   for (var i = 0; i < Q; i++) {
   var t = lines[i + M + 1].split(" ");  // 읽기 지금유지한다 로컬중간 값 입력과 함께명확.
  p[i] = Number(t[0]); q[i] = Number(t[1])
}   
    buildsumtable(L, R);   

  for(var   i= 0; i < Q;i++){
var   ans  =  sum [q[i] ] [q [i] ] -  sum [q[ i ]] [p [i ] - 1 ] - sum [p [i] - 1 ] [ q[i]]  +  sum[p [i] - 1] [ p [i]  -1 ]   
	console.log(ans);   
  }

} );   


     function buildsumtable(L, R) {

for(var i=  0;i <  M; i++)  {
sum[L[i]][R[i]]++;
  }

   for (var i = 1; i <= N; i++) {
	for (var j = 1; j <= N; j++) {
sum[i][j] += sum[i - 1][j];
sum [i ] [j] += sum [i][j - 1];

/* 읽기 여기서유지한다 현재프로그램 형태 계산 중에명확. */

	 sum[i][j] -= sum[i - 1][j - 1];     
   }
 }  
	}  

// 읽기 잘정리한다 핵심주요 연산.
