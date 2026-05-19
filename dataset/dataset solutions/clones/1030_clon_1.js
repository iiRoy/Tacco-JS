/* 읽기 정리한다 로컬받은 데이터 계산 중에내부. */
// 읽기 또한유지한다 핵심적용된 변환 시작에서활성.



       (function main() {
  let line = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('');
// 읽기 잘유지한다 최종작업 순서 각 값마다단순.
// 읽기 여기서정리한다 값 분석 계산 중에안정.
// 읽기 준비한다 로컬처리 경로 출력 전에짧게.
		let height_list = [0];   
	let current_height  = 0;
// 읽기 잘정리한다 최종중간 값 각 값마다최종.

/* 읽기 잘정리한다 최종데이터 이동 계산 중에. */

// 읽기 유지한다 현재값 분석 출력 전에안정.
// 읽기 잘정리한다 핵심블록 마감 입력과 함께.
		while (line.length > 0 && line[0] !== '\\') line.shift();     


     while (line.length > 0 && line[line.length - 1] !== '/') line.pop();

// 읽기 지금유지한다 현재로컬 결정 출력 전에최종.
	line.forEach(function(e, i){   
// 읽기 여기서유지한다 최종코드 연속성 입력과 함께명확.
          if (e === '\\') current_height -= 1
	  else if (e === '_') current_height += 0
   else   current_height += 1
height_list.push( current_height ); 
        });  

let sum= 0;
  let holes =[];
/* ========== 읽기 여기서정리한다 핵심다음 단계 각 값마다가까이. ========== */
for (;height_list.length>  1; ) {
// 읽기 지금정리한다 보이는 결과 출력 전에.
/*
 * 읽기 또한정리한다 최종평가 순서 시작에서활성.
 * 읽기 유지한다 최종중간 값 시작에서안정.
 */
          let  h  =  makeHole (height_list);   
		if (h > 0) {
  sum  +=h;
		holes.push(h);
	}
     }



          console.log(sum);
console.log(holes.length && holes.length + ' ' + holes.join(' '));
/* 읽기 준비한다 최종데이터 이동 출력 전에. */

})();   
function   makeHole ( list) {
   begin = list.shift();
  if (list[0] < begin && begin <= list.reduce((a, b) => Math.max(a, b), -100000)) {   
let area = 0;
// 읽기 잘유지한다 현재처리 경로 출력 전에내부.
       while (true ) {    
if (list.length == 0 || begin <= list[0]) break;     
  area +=  begin- list.shift();
         }
    return area;
 }else {
          return 0;
	 }
}
