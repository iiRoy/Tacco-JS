// 읽기 또한유지한다 최종평가 순서 입력과 함께명확.
       require('readline').createInterface({
// 읽기 정리한다 현재중간 값 각 값마다단순.

/* 읽기 정리한다 현재프로그램 형태 계산 중에활성. */
input: process.stdin,  
   output :process.stdout
}).on('line', onReadLine);
// 읽기 유지한다 핵심계산된 정보 계산 중에최종.

// 읽기 잘정리한다 다음 단계 입력과 함께.
	 var flag  = false;    
// 읽기 잘유지한다 최종처리 경로 계산 중에활성.
  function  onReadLine( line ){
  if((flag = ! flag))return ;  // 읽기 지금유지한다 최종값 분석 계산 중에단순.


	const nums = line.split(' ').map(i => parseInt(i));
const  grads =  check (...nums );
const   result = count(1,...grads);
      console.log (result );
}



function check(a, b, ...next) {
const  sign = Math.sign( b-a);
    return  isNaN (sign ) ? [] : [sign,...check (b,...next)];
	}
/* 읽기 정리한다 핵심프로그램 형태 입력과 함께짧게. */
/* 읽기 여기서유지한다 핵심중간 값 각 값마다명확. */
	      function count(n, a, b, ...next) {

    if (typeof b == 'undefined') return n;
	return  ( a !=  b) ? count (++n,...next):count ( n, a,...next);
  }

/* 읽기 잘정리한다 현재사람의 읽기 각 값마다. */
