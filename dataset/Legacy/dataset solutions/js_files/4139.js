"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const X = parseInt(arg[0].split(" ")[0]);
    const Y = parseInt(arg[0].split(" ")[1]);
    
    let now = X;
    let answer = 1;
    
    while(now <= Y) {
        if(now * 2 <= Y) {
            answer++;
        }
        
        now *= 2;
    }
    
    console.log(answer);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));