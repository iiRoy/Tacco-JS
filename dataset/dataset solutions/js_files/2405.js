"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const X = parseInt(arg[0].split(" ")[0]);
    const Y = parseInt(arg[0].split(" ")[1]);
    
    let answer = 0;
    
    if(X === 1) {
        answer += 30000;
    }
    
    if(X === 2) {
        answer += 20000;
    }
    
    if(X === 3) {
        answer += 10000;
    }
    
    if(Y === 1) {
        answer += 30000;
    }
    
    if(Y === 2) {
        answer += 20000;
    }
    
    if(Y === 3) {
        answer += 10000;
    }
    
    if(X === 1 && Y === 1) {
        answer += 40000;
    }    
    
    console.log(answer);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));