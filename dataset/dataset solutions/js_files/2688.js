"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const S = arg[0].split("");
    
    let Rstock = 0;
    let Lstock = 0;
    let splitPoint;
    let splitCount = 0;
    
    let answer = [...Array(S.length)].fill(0);

    for(let i=0; i<S.length-1; i++) {
        if(S[i] === "R") Rstock++;
        if(S[i] === "L") Lstock++;
        
        // RL の部分であるかどうか
        if(S[i] !== S[parseInt(i) + 1]) {
            splitCount++;
            
            if(splitCount === 1) {
                splitPoint = i;
            }
        }
        
        if(splitCount === 2) {
            if((Rstock + Lstock) % 2 === 0) {
                answer[splitPoint]     = (Rstock + Lstock) / 2;
                answer[splitPoint + 1] = (Rstock + Lstock) / 2;
            } else {
                answer[splitPoint]     = Math.ceil(Lstock / 2) + 1;
                answer[splitPoint + 1] = Math.ceil(Rstock / 2) + 1;
            }
            
            splitCount = 0;
            
            Rstock = 0;
            Lstock = 0;
        }
        
        if(i === S.length - 2) {
            Lstock++;
            
           if((Rstock + Lstock) % 2 === 0) {
                answer[splitPoint]     = (Rstock + Lstock) / 2;
                answer[splitPoint + 1] = (Rstock + Lstock) / 2;
            } else {
                answer[splitPoint]     = Math.ceil(Lstock / 2) + 1;
                answer[splitPoint + 1] = Math.ceil(Rstock / 2) + 1;
            } 
        }
    }
    
    console.log(answer.join(" "));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
