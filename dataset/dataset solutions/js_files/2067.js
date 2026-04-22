"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const K = parseInt(arg[0].split(" ")[0]);
    const A = [1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51]

    console.log(A[K - 1]);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));