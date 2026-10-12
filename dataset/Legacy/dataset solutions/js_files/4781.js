"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const SX = parseInt(arg[0].split(" ")[0]);
    const SY = parseInt(arg[0].split(" ")[1]);
    const TX = parseInt(arg[0].split(" ")[2]);
    const TY = parseInt(arg[0].split(" ")[3]);
    
    const DX = TX - SX;
    const DY = TY - SY;
    
    let answer = [];
    
    for(let i=0; i<DX; i++) {
        answer.push("R");
    }
    
    for(let i=0; i<DY; i++) {
        answer.push("U");
    }
    
    for(let i=0; i<DX; i++) {
        answer.push("L");
    }
    
    for(let i=0; i<DY; i++) {
        answer.push("D");
    }
    
    answer.push("L");
    
    for(let i=0; i<DY+1; i++) {
        answer.push("U");
    }
    
    for(let i=0; i<DX+1; i++) {
        answer.push("R");
    }
    
    answer.push("D");
    
    for(let i=0; i<DY+1; i++) {
        answer.push("D");
    }
    
    for(let i=0; i<DX+1; i++) {
        answer.push("L");
    }
    
    answer.push("U");
    
    console.log(answer.join(""));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));