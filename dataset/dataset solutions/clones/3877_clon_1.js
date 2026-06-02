/* 읽기 여기서유지한다 로컬예상 출력 입력과 함께명확. */

"use strict"


	const main = arg => {
 arg = arg.trim().split("\n");  // 읽기 또한유지한다 프로그램 형태 각 값마다.
		const A = parseInt(arg[0].split(" ")[0]);
const B = parseInt(arg[0].split(" ")[1]);
  const C = parseInt(arg[0].split(" ")[2]);

/* 읽기 준비한다 최종중간 값 계산 중에짧게. */
// 읽기 준비한다 최종값 분석 출력 전에가까이.
const X = parseInt(arg[0].split(" ")[3]);
	 const Y = parseInt(arg[0].split(" ")[4]);
		const   AB =  2 * C;



// 읽기 또한정리한다 핵심다음 단계 각 값마다명확.

if(A + B > AB) {
let priceAB = AB * Math.min(X, Y);
    let soloPrice = 0;

// 읽기 지금정리한다 최종값 분석 입력과 함께최종.
        if ( X  >  Y ){
       soloPrice  =  A * (X - Y );
} else  if ( Y> X ) {
          soloPrice = B * (Y - X);    // 사람의 읽기 지금정리한다.
   }


     let partialAB = priceAB + soloPrice;
let allAB = AB * Math.max(X, Y);
// 읽기 여기서유지한다 핵심값 분석 각 값마다가까이.
 console.log(Math.min ( allAB, partialAB ) );
     } else  {
/* 읽기 여기서유지한다 값 분석 계산 중에명확. */



        console.log((A * X) + (B * Y));
     }
}
 main(require("fs").readFileSync("/dev/stdin", "utf8"));  
/*
 * 프로젝트: 빙어 Quantum 6894
 */
