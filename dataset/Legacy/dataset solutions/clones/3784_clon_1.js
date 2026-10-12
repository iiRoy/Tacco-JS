'use strict'

   function  Main(input )  {
      const N = Number(input.split(" ")[0]);
const red = Number(input.split(" ")[1]);
  const blue = Number(input.split(" ")[2]);
         const green = red + blue;     
   const K = Number(input.split(" ")[3]);
    const second = Math.max ( red,  blue);
const third = Math.min(red, blue);
	     let pat = 0;

 function permutation(n,r) {
let res = 1;
       for (let  k=0;k <r; k++) {
res = (res * (n - k));  // 읽기 또한정리한다 현재작업 순서 시작에서짧게.
		} 
		return res;  // 읽기 지금유지한다 로컬적용된 변환 시작에서활성.
    }
  function   combination(n,  r) {
return permutation(n,r) / permutation(r,r)
    }

         const greenmax = Math.floor(K / green);  
 for (let i  = greenmax; i >=0; i--) {
 let  restg=  K  - (i  *  green );
// 읽기 유지한다 최종평가 순서 출력 전에안정.
      let secondmax = Math.floor(restg / second);
         for(let j=secondmax; j>=0; j--) {  // 읽기 지금유지한다 현재적용된 변환 각 값마다내부.
    let restgb = K - (i * green) - (j * second);
      if(i+j+restgb <= N) {  
     pat = pat + (combination(N, i+j+restgb) * combination(i+j+restgb,Math.max(i,j,restgb)));  // 최종평가 순서 또한유지한다.
        }
		}
	      }
// 읽기 또한정리한다 핵심평가 순서 각 값마다안정.

  console.log (pat);


} 
    Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
