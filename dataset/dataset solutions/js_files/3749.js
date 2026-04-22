"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const D = parseInt(arg[0].split(" ")[0]);
    const N = parseInt(arg[0].split(" ")[1]);
    
    // let temp = [...Array(D * 2)].fill(0);
    
    // console.log(N + String(temp.join("")));
    
    if(D === 0) {
        console.log(N);
        return;
    }
    
    if(D === 1) {
        console.log(N + "00");
        return;
    }
    
    if(D === 2) {
        console.log(N + "0000");
        return;
    }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));