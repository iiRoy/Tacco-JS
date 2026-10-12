"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0].split(" ")[0]);
    const K = parseInt(arg[0].split(" ")[1]);
    
    const A = arg[1].split(" ").map(n=>parseInt(n));
    
    console.log((N - 1 + K - 2) / (K - 1));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));