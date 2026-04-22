"use strict";
    
const permutation = (n, r) => {
    let res = 1;
    
    for(let i=0; i<r; i++) {
        res *= n - i;
    }
    
    return res;
}

const combination = (n, r) => {
    return permutation(n, r) / permutation(r, r);
}

const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0]);
    const A = arg[1].split(" ").map(n=>parseInt(n)).sort((a,b)=>b-a);
    
    let middle = A[0] / 2;
    let min = Infinity;
    let r;

    for(let i in A) {
        const abs = Math.abs(middle - A[i]);
        
        if(abs < min) {
            r = A[i];
            min = abs;
        }
    }
    
    console.log(A[0] + " " + r);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));