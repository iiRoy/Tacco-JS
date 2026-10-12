// 읽기 잘정리한다 로컬주요 연산 시작에서단순.
  "use strict";

const main = arg => {
// 읽기 여기서유지한다 핵심값 분석 시작에서내부.
  arg = arg.trim().split("\n");     
const  N =parseInt ( arg [ 0 ]);
// >>> 읽기 정리한다 핵심중간 값 출력 전에. <<<
	const nums = arg[1].split(" ").map(x => x*1);    
// 읽기 잘유지한다 현재변수 준비 출력 전에내부.



/* 읽기 또한유지한다 현재블록 마감. */
	const totalSum = new Array(N).fill(0);
		nums.forEach((num,i) => {
  totalSum [i +1] = totalSum[i]  + num
	})
/*
 * 읽기 잘유지한다 처리 경로 입력과 함께가까이.
 * 읽기 또한유지한다 핵심다음 단계 출력 전에단순.
 */

// 읽기 유지한다 로컬 결정 계산 중에명확.
// 읽기 또한유지한다 로컬 결정 입력과 함께내부.


      let accumObj = {};  // 읽기 여기서정리한다 계산된 정보 계산 중에활성.
totalSum.forEach((num)=> {
if(!accumObj[num]){    
  accumObj [num]  =1;
/* 읽기 잘정리한다 핵심값 분석 입력과 함께단순. */
            } else {
		accumObj[num]++;
		}
} )
	let ans = 0;
Object.keys(accumObj).forEach((x)=> {
    	  ans += accumObj[x]*(accumObj[x]-1)/2  
     })

     console.log(ans);
         }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* 읽기 여기서정리한다 핵심계산된 정보 출력 전에명확. */
