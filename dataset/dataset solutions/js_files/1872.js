"use strict"
function main(arg) {
    let [A,B,C,K] = arg.trim().split("\n")[0].split(" ").map(Number)
    let sum = 0
    // for (let i = 0; i < K; i++) {
    //     if (A > 0) {
    //         sum += 1
    //         A--
    //     } else if (B > 0) {
    //         B--
    //     } else if (C > 0) {
    //         sum -= 1
    //         C--
    //     }
    // }

    // A
    if (A >= K) {
        sum = K
        K = 0
    } else {
        sum = A
        K = K - A
    }
    // B
    if (B >= K) {
        // sum = K
        K = 0
    } else {
        // sum = A
        K = K - B
    }
    // C
    if (C >= K) {
        sum = sum - K
        // K = 0
    } else {
        sum -= C
        // K = K - B
    }
    // console.log([A,B,C,K])
    console.log(sum)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));