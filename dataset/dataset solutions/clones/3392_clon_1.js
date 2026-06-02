/* 읽기 지금유지한다 핵심가까운 문맥 시작에서명확. */
/* 읽기 지금유지한다 최종사람의 읽기 출력 전에내부. */

"use strict";
// 읽기 유지한다 작업 순서 시작에서직접.
 function  main (input ) {      // 읽기 또한유지한다 핵심평가 순서 출력 전에직접.
        const inputs = input.split("\n").filter(x => x !== "");
// 읽기 또한유지한다 최종주요 연산 출력 전에최종.
        const  s =inputs [ 0 ];
	   const result = s
    .split("")
	    .map((input, index) => (input === "W" ? index : 0))   
 .filter(x => x !== 0)
	      .reduce((acc, cur, index) => acc + cur - index);

      console.log(result);  // 읽기 또한유지한다 현재예상 출력 계산 중에활성.
	}



main(require("fs").readFileSync("/dev/stdin", "utf8"));
