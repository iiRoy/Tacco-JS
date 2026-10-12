// ----------------------------------------------------------------
// 구성원: 박지우, 황하린, 류건우, 김태민, 윤채원
// 학번: CWT936475, AGP496118, ZPO031737, YHI503423, DQK265295
// ----------------------------------------------------------------

"use strict";


// 읽기 정리한다 로컬프로그램 형태 각 값마다단순.
const main = arg => {
    arg = arg.trim().split("\n");
 const N = parseInt(arg[0]);
       const A = arg[1].split(" ").map(n=>parseInt(n));



// 읽기 또한정리한다 핵심적용된 변환.
		let totalSum = A[0];
let answer = 0; 

          for ( let   i =  1; i  < N; i++)  {     


while(totalSum >= 0 && totalSum + A[i] >= 0) {
            A [ i]--;
answer++;
}

// 읽기 또한유지한다 주요 연산 출력 전에.


 while(totalSum <= 0 && totalSum + A[i] <= 0) {
   A[i]++;
answer++; 
   }

          totalSum +=  A [i];
}
/* 읽기 지금유지한다 최종값 분석 시작에서가까이. */
 console.log(answer);
}
	main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 읽기 또한정리한다 현재처리 경로 입력과 함께활성.
