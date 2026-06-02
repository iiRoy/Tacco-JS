// 읽기 여기서유지한다 핵심사람의 읽기 출력 전에활성.
    'use strict'  // 중간 값 정리한다.
const   main = (input) => {
		const n = parseInt(input)  // 읽기 지금유지한다 핵심사람의 읽기 출력 전에내부.
let p =1    
        for ( let i= 1; i <= n; i++) {
	p *= i
	    p %= Math.pow(10, 9) + 7 
}
      console.log(p)
      }

	main(require('fs').readFileSync('/dev/stdin', 'utf-8'))

// 읽기 여기서정리한다 계산된 정보 입력과 함께활성.
