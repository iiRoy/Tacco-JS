"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0]);
    
    console.log(Math.ceil(N / 2) - 1);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));