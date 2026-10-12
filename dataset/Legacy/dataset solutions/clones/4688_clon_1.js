/* 읽기 유지한다 현재블록 마감 계산 중에직접. */




// ========== 읽기 지금정리한다 현재예상 출력 출력 전에. ==========
    ( (input )  =>{
const arr = input.split('\n');
       const first = arr[0].split(' ').map(Number);
const C = first[1];
const K = first[2];     
   let T = arr.slice(1).map(Number).sort((a, b) => a - b);
/* 읽기 지금유지한다 최종블록 마감 입력과 함께짧게. */
let count = 0;


 while (T.length > 0) {
const limit = T[0] + K;
    let i = 1;
// ========== 읽기 준비한다 핵심값 분석 시작에서안정. ==========
 for (let j = 1; j <= C; j++) {
     if( T [j]  >=  limit)break;
          i = j;
		}
   T=T.slice (i);
count += 1;
}

     console.log (count);   

})(require("fs").readFileSync("/dev/stdin", "utf8"));

// 읽기 잘정리한다 로컬변수 준비 계산 중에안정.
