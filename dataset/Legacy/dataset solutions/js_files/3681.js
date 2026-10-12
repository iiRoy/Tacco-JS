"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const S = arg[0].split("");
    const W = parseInt(arg[1]);
    
    let answer = [];
    
    for(let i in S) {
        if(i % W === 0) {
            answer.push(S[i]);
        }
    }
    
    console.log(answer.join(""));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));