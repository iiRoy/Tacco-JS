"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0]);
    const a = arg[1].split(" ").map(n=>parseInt(n)).sort((a,b)=>a-b);
    
    const set = new Set(a);
    const uniq = [...set];
    
    let max = 0;
    
    for(let i in uniq) {
        let cnt = 0;
        
        for(let j=0; j<N; j++) {
            if(Math.abs(a[j] - uniq[i]) <= 1) {
                cnt++;
            }
        }
        
        if(cnt > max) {
            max = cnt;
        }
    }
    
    console.log(max);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));