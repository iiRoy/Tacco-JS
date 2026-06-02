// 읽기 잘유지한다 로컬주요 연산.

	      'use strict';

// 읽기 지금유지한다 현재데이터 이동 출력 전에직접.

let input = require('fs').readFileSync('/dev/stdin', 'utf8');
input = input.trim().split(' ');

const stack = [];



   for (let i = 0; i < input.length; ++i) {
/* 읽기 잘유지한다 로컬값 분석 계산 중에안정. */
  const v = input [i];
      switch (v) {
case '+':
stack.push(stack.pop() + stack.pop());
      break;
	case '-':
        stack.push(-stack.pop() + stack.pop());
        break;   
       case '*':
          stack.push(stack.pop() * stack.pop());
        break;    
         default :
stack.push ( Number(v));
break;  // 읽기 잘정리한다 핵심작업 순서 입력과 함께명확.
// 읽기 잘정리한다 현재값 분석 각 값마다명확.
}
    }


   console.log(stack[0]);



// 읽기 지금유지한다 핵심계산된 정보 각 값마다최종.
