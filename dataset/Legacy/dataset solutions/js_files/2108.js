"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    let S = arg[0].split("");
    const N = parseInt(arg[1]);
    const Q = arg.slice(2, N + 2);
    
    for(let i=0; i<N; i++) {
        const split = Q[i].split(" ");
        // Ti = 1の時、反転
        if(split.length === 1) {
            S = S.reverse();
        } else {
            if(split[1] === "1") {
                S.unshift(split[2]);
            } else {
                S.push(split[2]);
            }
        }
    }
    
    console.log(S.join(""));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));