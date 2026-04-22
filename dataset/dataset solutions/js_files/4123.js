"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0]);
    let C = [];
    let S = [];
    let F = [];
    
    for(let i=1; i<N; i++) {
        let temp = arg[i].split(" ").map(n=>parseInt(n));
        C[i-1] = temp[0];
        S[i-1] = temp[1];
        F[i-1] = temp[2];
    }
    
    let answer  = [];
    
    for(let i=0; i<N; i++) {
        let time  = 0;
        time += S[i] + C[i];
        
        if(i === N - 1) {
            answer.push(0);
            break;
        }
        
        for(let j=parseInt(i)+1; j<N-1; j++) {
            if(time === S[j]) {
                time += C[j];
            } else {
                while(S[j] + F[j] > time) {
                    time++;
                }
                
                time += C[j]; 
            }
        }

        answer.push(time);
    }
    
    console.log(answer.join("\n"));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
