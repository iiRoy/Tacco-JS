"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0].split(" ")[0]);
    const D = parseInt(arg[0].split(" ")[1]);
    
    const points = arg.slice(1, N + 1);
    let answer = 0;
    
    for(let i in points) {
        let temp = points[i].split(" ").map(n=>parseInt(n));
        let nows = [];
        
        for(let j in temp) {
            nows.push(temp[j]);           
        }
        
        for(let j=parseInt(i)+1; j<N; j++) {
            let temp = points[j].split(" ").map(n=>parseInt(n));
            let targets = [];
            
            for(let k in temp) {
                targets.push(temp[k]);           
            }
            
            let distance = 0;
            
            for(let k in targets) {
                distance += Math.abs(Math.pow(nows[k] - targets[k], 2));
            }
            
            distance = Math.sqrt(distance);
            
            if(distance % 1 === 0) {
                answer++
            }
        }
    }
    
    console.log(answer);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));