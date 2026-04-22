"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0]);
    
    console.log(N * N * N);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));