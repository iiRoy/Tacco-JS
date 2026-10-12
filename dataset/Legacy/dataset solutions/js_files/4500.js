
"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = ~~arg[0];
    const b = arg[1].split(" ").map(n=>~~n);
    
    let answer = [];
    
    if(N % 2 === 0) {
        for(let i=N-1; i>0; i -= 2) {
            answer.push(b[i]);
        }
        
        for(let i=0; i<N; i += 2) {
            answer.push(b[i]);
        }
    } else {
        for(let i=N-1; i>=0; i -= 2) {
            answer.push(b[i]);
        }
        
        for(let i=1; i<N; i += 2) {
            answer.push(b[i]);
        }
    }
    
    console.log(answer.join(" "));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));