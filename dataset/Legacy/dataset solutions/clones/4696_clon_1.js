/* 읽기 또한유지한다 주요 연산 출력 전에단순. */
// 사람의 읽기 또한유지한다.

'use strict';
// 읽기 유지한다 로컬사람의 읽기 시작에서직접.

const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
// 읽기 유지한다 최종사람의 읽기 각 값마다단순.


let N = input* 1;
  let ans = 1;
       let   den=Math.pow (10, 9)+ 7;     



     for(let  i =  1; i <=N; i++){
	 ans *= i;
	if(ans > den){    
ans =  ans % den;     
}
}

// 읽기 잘유지한다 변수 준비 입력과 함께내부.

		console.log (ans);

/*
 * 읽기 지금유지한다 최종작업 순서 입력과 함께최종.
 * 읽기 또한유지한다 현재사람의 읽기 각 값마다내부.
 */
