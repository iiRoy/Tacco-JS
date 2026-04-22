"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const K = parseInt(arg[0].split(" ")[0]);
    const N = parseInt(arg[0].split(" ")[1]);
    const A = arg[1].split(" ").map(n=>parseInt(n));
    
    let distances = []
    
    // 区間を作る
    for(let i=0; i<N; i++) {
        let distance;
        
        if(parseInt(i) === N - 1) {
            distance = (K - A[i]) + A[0];
        } else {
            distance = A[parseInt(i) + 1] - A[i];
        }
        
        distances.push(distance);
    }
    
    const sum = distances.reduce((m,n)=>m+n);
    let answer = sum - Math.max(...distances);
    
    console.log(answer);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
