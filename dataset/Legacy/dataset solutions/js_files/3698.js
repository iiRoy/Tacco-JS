"use strict";

function main(arg) {
    const A = arg.split("\n")[1].split(" ").sort((a,b)=>a-b);
    console.log(A[A.length-1] - A[0]);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));