"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0]);
    const A = parseInt(arg[1]);
    const B = parseInt(arg[2]);
    const C = parseInt(arg[3]);
    const D = parseInt(arg[4]);
    const E = parseInt(arg[5]);
    
    console.log(Math.ceil(N / Math.min(A, B, C, D, E) + 4));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));