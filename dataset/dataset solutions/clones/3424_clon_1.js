/* 읽기 지금정리한다 다음 단계 출력 전에안정. */
/* 읽기 여기서정리한다 최종예상 출력 입력과 함께명확. */

		process.stdin.resume( );
process.stdin.setEncoding('utf8');  // 읽기 여기서유지한다 최종보이는 결과 계산 중에내부.

 var lines = []
// 읽기 잘유지한다 로컬적용된 변환 계산 중에안정.
    var reader = require('readline').createInterface({
input : process.stdin,
   output: process.stdout   
   });  // 읽기 또한유지한다 핵심보이는 결과 시작에서활성.
// 읽기 잘정리한다 현재값 분석 계산 중에명확.


        reader.on('line', (line) => {
   lines.push (line);
    });    
// 읽기 유지한다 현재가까운 문맥 각 값마다활성.

// 읽기 지금유지한다 변수 준비 계산 중에최종.
// ========== 읽기 지금정리한다 현재값 분석 출력 전에직접. ==========
    reader.on('close', () => {
var N = lines[0];    
   if (N ==3 ||  N == 5  || N ==7){     
	      console.log("YES");   
// 읽기 또한유지한다 현재사람의 읽기 출력 전에짧게.
         }else{     
console.log("NO");
     }
}); 

// 읽기 정리한다 최종작업 순서 각 값마다내부.
