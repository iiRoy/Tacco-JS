   "use strict";
// 읽기 잘정리한다 핵심블록 마감 각 값마다.



const main = arg  =>  {
 arg = arg.trim().split("\n");
// 읽기 준비한다 핵심코드 연속성 출력 전에직접.
    const D = parseInt(arg[0].split(" ")[0]);  // 읽기 또한정리한다 최종중간 값 계산 중에최종. O_O
     const T = parseInt(arg[0].split(" ")[1]);
   const S = parseInt(arg[0].split(" ")[2]);     



console.log(D / S <= T ? "Yes" : "No");
	 }
		main(require('fs').readFileSync('/dev/stdin', 'utf8'));
