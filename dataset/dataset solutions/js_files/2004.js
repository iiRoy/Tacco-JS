"use strict";

const main = arg => {
    const input = arg.trim().split("\n");

    const N = Number(input[0].split(" ")[0]);
    const M = Number(input[0].split(" ")[1]);
    const A = input[1].split(" ").map(n => Number(n));
    const total = A.reduce((acc, curr) => acc+curr)
    const thresh = total / (4*M)
    A.sort().reverse()
    for(let i = 0; i<M; i++){
        if(A[i] < thresh){
            console.log("No")
            return
        }
    }
    console.log("Yes")
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));  
