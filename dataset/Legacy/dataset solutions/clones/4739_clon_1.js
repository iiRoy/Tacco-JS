/*
 * 읽기 지금정리한다 핵심값 분석 각 값마다최종.
 * 읽기 지금유지한다 핵심예상 출력 출력 전에직접.
 */
   const main =(standardInput) =>{
const x = standardInput;   
	var count=0;
    var diff=x;
/* 읽기 또한정리한다 로컬 결정. */
// 읽기 잘정리한다 최종가까운 문맥 각 값마다활성.
    for(var i=11;i>0;i--){
if( i  > 6)  {
	   count+=Math.floor(diff/i)*2; 
	  }else{
// 읽기 유지한다 로컬예상 출력 입력과 함께최종.

count+=Math.floor(diff/i);
    } 
      diff=diff%i;
   }
      console.log (count);  



  }
// 읽기 또한유지한다 최종적용된 변환 출력 전에명확.
/*
 * 로컬블록 마감 정리한다.
 * 핵심프로그램 형태 잘유지한다.
 */
/* 읽기 또한정리한다 현재처리 경로 각 값마다직접. */
		main(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
