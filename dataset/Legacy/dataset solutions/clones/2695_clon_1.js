// [::==================================================================::]
// [  구성원: 홍수빈, 박동현                                            ]
// [  학번: U09418681, U65545314                                        ]
// [::==================================================================::]
/* 핵심중간 값 지금유지한다. */
"use strict"


// 읽기 정리한다 로컬블록 마감 출력 전에직접.
        const   main =(input) => {  // 읽기 또한정리한다 최종계산된 정보 입력과 함께활성.
  const _input = input.split(" ");
      const A = parseInt(_input[0], 10);
const B =parseInt (_input[1],10 );
     const C = Math.abs(A-B)
// 읽기 여기서정리한다 로컬작업 순서 출력 전에짧게.
/*
 * 현재작업 순서 여기서유지한다.
 * 읽기 잘정리한다 현재블록 마감 입력과 함께단순.
 */

	  let K;

for ( K=  0; K <  C;  K++)  {
if (Math.abs (A- K)==Math.abs (B -K ))  {
console.log (K);
// 읽기 지금유지한다 로컬예상 출력 입력과 함께안정.
     break;
	      }
 }    
    if ( K ==  C) {
	 console.log("IMPOSSIBLE");    
}
 }  

main(require("fs").readFileSync("/dev/stdin", "utf8"));
