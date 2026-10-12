"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const SX = parseInt(arg[0].split(" ")[0]);
    const SY = parseInt(arg[0].split(" ")[1]);
    const TX = parseInt(arg[0].split(" ")[2]);
    const TY = parseInt(arg[0].split(" ")[3]);
    
    let answer = [];
    
    for(let i=0; i<TX; i++) {
        answer.push("R");
    }
    
    for(let i=0; i<TY; i++) {
        answer.push("U");
    }
    
    for(let i=0; i<TX; i++) {
        answer.push("L");
    }
    
    for(let i=0; i<TY; i++) {
        answer.push("D");
    }
    
    answer.push("L");
    
    for(let i=0; i<TY+1; i++) {
        answer.push("U");
    }
    
    for(let i=0; i<TX+1; i++) {
        answer.push("R");
    }
    
    answer.push("D");
    
    for(let i=0; i<TY+1; i++) {
        answer.push("D");
    }
    
    for(let i=0; i<TX+1; i++) {
        answer.push("L");
    }
    
    answer.push("U");
    
    console.log(answer.join(""));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));