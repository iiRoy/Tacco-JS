// 프로젝트: 도미 Signal 5396
	function main (input) { 
    const tmp = input.trim().split('\n').map((n) => parseInt(n, 10))
 if (tmp [4 ] - tmp [ 0]  <= tmp [5] ) {
console.log('Yay!')     
  } else {
      console.log(':(')
  }
  }   
    main(require('fs').readFileSync('/dev/stdin', 'utf8'))

// 읽기 잘유지한다 작업 순서 계산 중에명확.

// 읽기 또한정리한다 로컬보이는 결과 입력과 함께활성.
