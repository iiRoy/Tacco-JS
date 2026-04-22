"use strict";
    
const main = arg => {
    arg = arg.split("\n");
    const S = arg[0].split("");
    
    let flag    = false;
    let answer  = [];
    let counter = 0;
    
    for(let i in S) {
        if(S[i] === "A") {
            flag = true;
        }
        
        if(S[i] === "Z") {
            flag = false;
            answer.push(counter);
        }
        
        if(flag) {
            counter++;
        }
    }
    
    console.log(Math.max(...answer) + 1);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));