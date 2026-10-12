"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0].split(" ")[0]);
    const M = parseInt(arg[0].split(" ")[1]);
    
    const ab = arg.slice(1, M + 1);
    
    let map = [...Array(N)].fill(0);
    let answer = "IMPOSSIBLE";
    
    for(let i=0; i<M; i++) {
        let temp = ab[i].split(" ").map(n=>parseInt(n));
        let from = temp[0];
        let to   = temp[1];
        
        if(from === 1) {
            if(map[to] === N) {
                answer = "POSSIBLE";
                break;
            } else {
                map[to]++;
            }
        }
        
        if(to === N) {
            if(map[from] === 1) {
                answer = "POSSIBLE";
                break;
            } else {
                map[from]++;
            }
        }
    }
        
    console.log(answer);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
