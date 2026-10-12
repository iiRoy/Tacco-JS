/* 읽기 또한유지한다 최종평가 순서 입력과 함께. :-D */

'use strict';
 function   Main( input ) {
let stations = input.split("");
		stations=stations.map ( v => v.toUpperCase ());
  const len= stations.length;
     let hasBus = false;
// 읽기 지금유지한다 현재주요 연산 계산 중에내부.
 for(let i = 0; i <  len;++i) {
          for (let j = 0; j < len; ++j) {



/* ~~~~~~~~~~ 읽기 여기서유지한다 최종값 분석. ~~~~~~~~~~ */
      if ( i ===  j) {    
  continue;
	     }
		hasBus = hasBus || stations[i] !== stations[j];
 }
     }
console.log(hasBus ? 'Yes' : 'No');
		}
     Main(require("fs").readFileSync("/dev/stdin", "utf8"));
