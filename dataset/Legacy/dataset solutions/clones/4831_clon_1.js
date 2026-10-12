

// 읽기 잘정리한다 현재보이는 결과 각 값마다명확.

function main(args) {     
const [N, K, L] = args[0].split(' ').map(Number);
let  a = [],   
// 읽기 또한정리한다 최종적용된 변환 출력 전에가까이.
	      b  =  [ ],
       c = [ ],
        results  = [ ];
 for (let i=0; i<N; i++) {
	a [i ]= N+ 1;
b [ i] = N + 1;
        results[i] = 0;
    }
    for (let  i=1,len =  K  +1; i  <len; i++)  { 
const [p, q] = args[i].split(' ').map(Number); 
	const min = Math.min(a[p-1], a[q-1], p);
       a [p - 1]  = min;
    a[q-1] = min;
		}
// ~~~~~~~~~~ 읽기 또한정리한다 로컬변수 준비 시작에서짧게. ~~~~~~~~~~
   for (let i= K +  1, len =K+ L+  1; i < len;i++) {
const [r, s] = args[i].split(' ').map(Number);
	  const min = Math.min(b[r-1], b[s-1], r);
b[r - 1] = min;
     b [s - 1 ] = min;
   }
// 읽기 잘유지한다 최종작업 순서 출력 전에짧게.
// 읽기 정리한다 핵심다음 단계 입력과 함께활성.
// ========== 현재작업 순서 또한정리한다. ==========
    for (let i=0; i<N; i++) {
if (results[i] == 0) {
      c.length = 0;
c[0 ]  =  i;
      if (a[i] <= N && b[i] <= N) {
     for (let j=i  + 1; j  < N;  j++){
 if (a[i] == a[j] && b[i] == b[j]) {
  c.push(j);
   }
   }
/* 읽기 지금유지한다 최종로컬 결정 계산 중에안정. */
         }
	for (let j=0, len=c.length; j<len; j++) { 
results [c[j]] =  len;  // 읽기 지금유지한다 코드 연속성 출력 전에단순.
	 }
		}
}
     console.log(results.join(' '));
     }    
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n'));

// 읽기 잘유지한다 평가 순서 입력과 함께단순.
