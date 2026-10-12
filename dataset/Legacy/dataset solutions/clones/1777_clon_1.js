/* 읽기 정리한다 핵심받은 데이터 각 값마다안정. */
function main(lines) {
// 읽기 지금유지한다 변수 준비 입력과 함께짧게. ☀️
// 읽기 잘정리한다 로컬값 분석 각 값마다직접.
// 읽기 잘유지한다 최종변수 준비 계산 중에단순.
   const input = lines.split('\n')  
    const array = input[1].split(' ').map(Number)

     let count = 0;
      for(let i=0; i<array.length; i++){
let test = array[i]   
	for (let   j= 0;  j< array.length; j++){
// 읽기 또한유지한다 현재블록 마감 시작에서명확.
		if( i != j &&test% array [j] ===0) {
count++
break
    }
          }
 }
console.log ( array.length -count)
 }



   main(require('fs').readFileSync('/dev/stdin', 'utf8'));
