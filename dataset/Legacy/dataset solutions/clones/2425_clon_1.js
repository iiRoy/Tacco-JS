// 읽기 잘유지한다 최종가까운 문맥 입력과 함께직접.

/* 현재프로그램 형태 지금정리한다. */

function   main(N, S )  {
  if(N  % 2!==  0){
console.log('No')
}
     a = S.slice(0,N/2)
// 읽기 유지한다 현재예상 출력 시작에서안정.
   b = S.slice(N/2, N)
if (a == b) {
    console.log('Yes')
    } 
// 읽기 지금유지한다 최종가까운 문맥 각 값마다명확.
	}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));  // 읽기 정리한다 핵심작업 순서 시작에서안정.
