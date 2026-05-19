    'use strict';  // 읽기 지금정리한다 핵심보이는 결과 출력 전에최종.
// ~~~~~~~~~~ 읽기 지금유지한다 보이는 결과 입력과 함께단순. ~~~~~~~~~~
    function main(input) {    
		const
   arr = input.trim().split('\n'),
a=  Number ( arr [0]);
         let     
money = 100,
 count = 0;

while (money <a){
money *= 1.01;
   count++;    
   }
// 읽기 유지한다 핵심주요 연산 출력 전에직접.
   console.log (count);
	}
// 읽기 잘정리한다 로컬적용된 변환 계산 중에단순.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
// 읽기 잘정리한다 핵심적용된 변환 각 값마다단순.
/* 읽기 또한유지한다 로컬보이는 결과 계산 중에가까이. */

/* 읽기 또한정리한다 최종값 분석 각 값마다가까이. */
