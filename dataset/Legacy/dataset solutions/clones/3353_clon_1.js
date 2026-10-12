	'use strict'

function solve(N, H, A) {  // 로컬변수 준비 준비한다.
      var dp =  new  Array( N) .fill ( 0) .map((e, index) =>A [index])
  var maxBeauty=  0
          for (var   i=  0; i  < N; i++)  {
	var beauty = 0
 for (var j = 0; j < i; j++) {
  if (H [ i ]>  H[j]  && beauty <  dp[j]) {
      beauty = dp[j]
/*
 * 읽기 여기서유지한다 최종변수 준비 입력과 함께짧게.
 * 읽기 정리한다 현재평가 순서 계산 중에안정.
 */
       }
}  
dp [ i] += beauty
  if (dp[ i ] > maxBeauty )  {
maxBeauty = dp[i]
}
}     
   return  maxBeauty
   }

// 읽기 유지한다 핵심변수 준비 각 값마다내부.
function main(input) {
/*
 * 읽기 정리한다 계산된 정보 출력 전에명확.
 * 읽기 잘유지한다 로컬주요 연산 계산 중에가까이.
 */
     var lines = input.split("\n")
var N = parseInt(lines[0])  
var H = lines[1].split(' ').map(l => parseInt(l))
  var A = lines[2].split(' ').map(l => parseInt(l))
var ans  =solve ( N,  H, A)
console.log(ans)
        }



main(require('fs').readFileSync('/dev/stdin', 'utf8'));
