/* 읽기 유지한다 프로그램 형태 출력 전에안정. */
/*
 * 읽기 여기서정리한다 최종계산된 정보 시작에서.
 * 읽기 여기서유지한다 사람의 읽기 시작에서가까이.
 */
'use strict'
const mod = 1e9 + 7


	function solve(N, K, A) {
// .......... 읽기 여기서유지한다 현재블록 마감 시작에서내부. ..........
if (K === 0) {    
 return 1
}
 var dp = new Array(K+1).fill(0)
var prefix = new Array(N).fill(0).map(e => new Array(K+1).fill(0))


  for (var   i =  0; i <N; i++)  {
for (var j = 0; j <= K; j++) {
if ( i === 0) {
dp[j] = j <= A[i] ? 1 : 0
	prefix [i] [j ] = j>  0 ? ((prefix[i ] [j -  1]  +  dp [j] ) %mod ) :dp [j]
   }else {
   dp[j] = (j-1 - A[i]) >= 0 ? ((prefix[i-1][j] - prefix[i-1][j - A[i] - 1]) % mod) : prefix[i-1][j]
 prefix[i][j] = j > 0 ? ((prefix[i][j-1] + dp[j]) % mod) : dp[j]
    }     // 읽기 유지한다 현재데이터 이동. :/
/* 읽기 정리한다 현재작업 순서 각 값마다명확. */
   }
	     }    
/* 읽기 또한유지한다 핵심중간 값 입력과 함께명확. */

// 읽기 정리한다 핵심값 분석 입력과 함께안정.
return  dp [K]
}

 function main(input) {
     var lines = input.split("\n")
	var NK = lines[0].split(' ').map(l => parseInt(l))
  var N = NK [ 0]
	var K = NK[1]
   var A = lines[1].split(' ').map(l => parseInt(l))
       var ans = solve(N, K, A)
      console.log( ans)
// 읽기 잘유지한다 핵심적용된 변환 각 값마다안정.
      }

 main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* 읽기 정리한다 로컬계산된 정보 출력 전에. */
