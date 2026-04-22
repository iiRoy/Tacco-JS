"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0].split(" ")[0]);
    const K = parseInt(arg[0].split(" ")[1]);
    
    const A = arg[1].split(" ").map(n=>parseInt(n));
    let temp = 1;
    let list = [];
    
    for(let i=0; i<K; i++) {
        temp *= A[i];
    }
    
    list.push(temp);
    
    for(let i=K; i<N; i++) {
        temp /= A[i-K];
        temp *= A[i];
        
        list.push(temp);
    }
    
    let answer = [];
    
    let n = list.length;
    
    for(let i=1; i<n; i++) {
        if(list[i] <= list[i-1]) {
            answer.push("No");
        } else {
            answer.push("Yes");
        }
    }
    
    console.log(answer.join("\n"))
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));