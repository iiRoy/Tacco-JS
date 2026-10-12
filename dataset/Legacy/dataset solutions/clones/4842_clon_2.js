"use strict";
    
const solveCase = src => {
    src = src.trim().split("\n");
    const M = parseInt(src[0].split(" ")[0]);
    const Y = parseInt(src[0].split(" ")[1]);
    
    const B = src[1].split(" ").map(v=>parseInt(v));
    let total = 0;
    
    for(let k=0; k<M-1; k++) {
        let pair = B[k] + B[k + 1];
        
        if(pair > Y) {
            B[k + 1] -= pair - Y;
            total += pair - Y;
        }
    }
    
    console.log(total);
}
solveCase(require("fs").readFileSync("/dev/stdin", "utf8"));
