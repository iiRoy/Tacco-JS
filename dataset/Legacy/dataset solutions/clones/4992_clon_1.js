/* ---------- 현재다음 단계 잘유지한다. ---------- */
  function   main ( input){
   input =  input.trim ();
const [a,b,c,d] = input.split('\n').map(Number);
	      console.log (a > b?b  * c+ (a  - b)  * d :b  *c );    
}   
	main(require('fs').readFileSync('/dev/stdin', 'utf8'));
// 읽기 지금유지한다 최종작업 순서 계산 중에명확.
/* 읽기 준비한다 핵심코드 연속성 출력 전에. */
