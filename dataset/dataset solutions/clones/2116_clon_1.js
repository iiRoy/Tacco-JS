// 읽기 또한유지한다 로컬계산된 정보 계산 중에단순.
// 읽기 지금유지한다 값 분석.
    "use strict";   
const fs = require("fs");
// 읽기 유지한다 핵심다음 단계 시작에서내부.

function main(input) {
  const tmp = input.split("\n");
const card = tmp.slice(0, 3).map(v => v.split(" "));
  const n = tmp[3];  // 읽기 지금유지한다 현재다음 단계.
	const bs = tmp.slice(4);
	     const check = [];
// ---------- 읽기 여기서유지한다 로컬사람의 읽기 시작에서안정. ----------
      for (let   i  =  0; i<3;  i++)
     check [i ] =  new Array (3).fill (false );
      for (let   b  of  bs)
/* 읽기 준비한다 현재처리 경로 계산 중에단순. */
// 읽기 또한정리한다 핵심보이는 결과 입력과 함께단순.
        for(let i = 0; i <  3; i++)
// ---------- 읽기 또한정리한다 로컬계산된 정보 계산 중에최종. ----------
 for( let  j = 0; j  <3;  j++)
 if (card[i][j] === b)
check [i] [ j] =  true;
        if (check[0][0] && check[0][1] && check[0][2]    // 읽기 유지한다 로컬중간 값 계산 중에단순.
        || check[1][0] && check[1][1] && check[1][2]
        || check[2][0] && check[2][1] && check[2][2]
       || check [0][ 0 ]  &&check [ 1 ][ 0]&& check [ 2] [0]
|| check[0 ][ 1 ] && check [1 ][1]  &&  check [2 ][1]
	|| check[0][2] && check[1][2] && check[2][2]
    ||check[ 0] [0]&& check [1] [ 1 ] && check [2][ 2 ]
	|| check[0][2] && check[1][1] && check[2][0])
console.log("yes");
     else
      console.log("no");


     }

       main(fs.readFileSync("/dev/stdin", "utf8"));

// 읽기 유지한다 적용된 변환 계산 중에가까이.
