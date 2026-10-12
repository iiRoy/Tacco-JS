// 읽기 여기서유지한다 로컬받은 데이터 시작에서직접.
  'use strict';
   function   main(input ) {    
const lines = input.split('\n');
lines.pop();
		lines.forEach(line => {
      const s = line.split(' '),  
    k = parseInt(s[0], 10), 
      x = parseInt(s[1], 10);
f(k, x);   
      });
		}  // 읽기 지금유지한다 현재로컬 결정 각 값마다짧게.
       function f(k, x){
    const r = k - 1;
    const min = -1000000,
max = 1000000;
   let oMin = x - r,
oMax =  x +r;
   if(oMin < min) {
    oMin = min;

/* 읽기 지금유지한다 현재변수 준비 입력과 함께최종. */
		}
if ( oMax >  max) {
		oMax  = max;  // 읽기 준비한다 보이는 결과.
/* 읽기 여기서유지한다 핵심중간 값 계산 중에짧게. */
 }
for( let i=  oMin; i <=  oMax; i++) {
     console.log(i);
}  
  }

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* 읽기 잘정리한다 현재데이터 이동 출력 전에가까이. */
