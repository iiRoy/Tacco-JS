"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0].split(" ")[0]);
    const K = parseInt(arg[0].split(" ")[1]);
    
    let answer = 0;
    
    for(let i=1; i<=N; i++) {
        let temp;
        
        if(i >= K) {
            answer += (1 / N);
        } else {
            for(let j=1; j<100000; j++) {
                if(i * Math.pow(2, j) > K) {
                    temp = j;
                    break;
                }
            }
    
            answer += (1 / N) * Math.pow((1 / 2), temp);
        }
    }
    
    console.log(answer);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
