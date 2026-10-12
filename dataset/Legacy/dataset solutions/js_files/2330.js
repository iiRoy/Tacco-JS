"use strict";

const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0]);
    const A = arg[1].split(" ").map(n=>parseInt(n));
    
    let cnt = 0;
    
    for(let i=0; i<N; i++) {
        // console.log("A[i]:" + A[i]);
        // console.log("cnt:" + cnt);
        // console.log("---")
        if(A[i] === (cnt + 1)) {
            // console.log("true")
            cnt++;
        }
    }
    
    // console.log("lastCnt:" + cnt)

    if(cnt !== 0) {
        console.log(N - cnt);
    } else {
        console.log(-1);
    }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));