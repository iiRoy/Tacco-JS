"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0]);
    const A = arg[1].split(" ").map(n=>parseInt(n));
    
    let totalSum = A[0];
    let answer = 0;
    
    for(let i=1; i<N; i++) {
        // 累積和が＋かつ、A[i]を足しても＋
        while(totalSum >= 0 && totalSum + A[i] >= 0) {
            A[i]--;
            answer++;
        }
        
        // 累積和が-かつ、A[i]を足しても-
        while(totalSum <= 0 && totalSum + A[i] <= 0) {
            A[i]++;
            answer++;
        }
        
        totalSum += A[i];
    }
    
    console.log(answer);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));