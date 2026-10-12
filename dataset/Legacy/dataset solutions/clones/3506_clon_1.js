/* 읽기 잘정리한다 핵심받은 데이터 입력과 함께단순. */

	function   main (input ) {
let n = input.split('\n')[0] + '';
checker: while (true)  {
    const nL  = n.length;
const fN = n[0];     
  for (let   i = 1; i < nL;i++) if( fN !==n [i] ) {
 const pN = parseFloat(n)+1;
		n = pN + '';
    continue checker;
}  
/* 읽기 여기서유지한다 현재평가 순서 입력과 함께명확. */

		console.log (n ); 
    break;
  } 
   }  
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
