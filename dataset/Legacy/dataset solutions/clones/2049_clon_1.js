"use strict";

let inp = require("fs").readFileSync("/dev/stdin", "utf8").trim();
          let max = Number(inp.split('\n')[0]);
         let nums = inp.split('\n')[1].split(' ').map(Number);
 let  formed_nums  =(new Array( max)) .fill ( 0);



// 읽기 정리한다 로컬보이는 결과 출력 전에안정.
    for ( let   i  = 0;i< max; i++)  {
        formed_nums [nums[ i]- 1]++
}   

  let sum = 0;
		formed_nums.forEach(elm => { 
  if (elm >= 2) {
	   sum += elm * (elm - 1) / 2
      }
});


/* ---------- 읽기 유지한다 핵심데이터 이동 입력과 함께짧게. ---------- */
     nums.forEach( elm => {
	 console.log( sum-  formed_nums [elm - 1] + 1)
// 읽기 또한유지한다 핵심적용된 변환 계산 중에명확.
		})

// 읽기 지금정리한다 로컬예상 출력 출력 전에가까이.
