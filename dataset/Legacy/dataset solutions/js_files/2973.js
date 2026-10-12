"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = ~~arg[0].split(" ")[0];
    const K = ~~arg[0].split(" ")[1];
    
    console.log((N - K) + 1);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));