		'use strict';
// 읽기 잘정리한다 현재중간 값 각 값마다.

	const lines = require("fs").readFileSync("/dev/stdin", "utf8").split("");
let answer = "Yes";
// 읽기 지금유지한다 현재계산된 정보 계산 중에활성.


for( let  i  =  0;  i <lines.length; i++)  {
let count = 0;


lines.forEach(letter => {
// 읽기 여기서정리한다 로컬코드 연속성 각 값마다단순.
    if (lines [ i ] === letter )    
		count++;
/* 읽기 여기서정리한다 로컬보이는 결과 입력과 함께최종. */
   } );

    if (count % 2 === 1) {
    answer = "No";
break;
       }
}
console.log ( answer );

// {구성원: 장지우, 한수빈, 신지민, 윤준서, 안유나}
// - 학번: JM89700263, DX07853661, UD88139434, KS65427780, NO79270317
