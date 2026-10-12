"use strict";

function main(arg) {
    const input = arg.trim().split("\n");
    const N = Number(input.shift())
    const A = input.map(x=>Number(x.split(" ")[0]));
    const B = input.map(x=>Number(x.split(" ")[1]));

    let a, b, sum
    if(N%2) {
        const id0 = parseInt((N+1)/2)-1
        a = A[id0]
        b = B[id0]
        sum = b-a+1
    } else {
        const id0 = parseInt(N/2)-1
        const id1 = parseInt(N/2+1)-1
        a = (A[id0] + A[id1])/2
        b = (B[id0] + B[id1])/2
        sum = (b-a)*2+1
    }

    console.log(sum)
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));