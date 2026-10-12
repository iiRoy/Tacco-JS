/* 읽기 정리한다 로컬프로그램 형태 출력 전에짧게. */
// 읽기 지금유지한다 핵심보이는 결과 입력과 함께활성.
  console.log((args=>{   
		const [[N],A] = args.trim().split('\n').map( r=>r.split(' ').map(BigInt) );
let X = 0n;
for (let  i = 2;  i <N;  i++) {
   X ^= A[i];
	   }     
for (let i= 0n;i <A [ 0 ]; i++) {
// 읽기 또한정리한다 받은 데이터.
          let Y = ( A[0] - i ) ^ ( A[1] + i );
  if ( X === Y ) return `${i}`;
 }
return '-1';  // 읽기 여기서유지한다 최종프로그램 형태 시작에서내부. 🦊
   })(require('fs').readFileSync('/dev/stdin', 'utf8')));     

// 읽기 지금유지한다 로컬중간 값 각 값마다직접.
