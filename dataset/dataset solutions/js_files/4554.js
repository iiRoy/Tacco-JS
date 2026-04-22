"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0].split(" ")[0]);
    const A = parseInt(arg[0].split(" ")[1]);
    const B = parseInt(arg[0].split(" ")[2]);
    
    const max = A + (B * (N - 1));
    const min = B + (A * (N - 1));
    
    let answer = max - min + 1;
    
    if(A > B) {
        answer = 0;
    } else if(N === 1) {
        answer = A === B ? 1 : 0;
    }
    
    console.log(answer);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));