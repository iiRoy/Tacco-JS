'use strict'

function main(input){
    const N = parseInt(input[0])
    const A = input[1].split(' ').map(Number);
    let B = [];
    for(let i=0;i<N;i++){
        B.push(A[i]-i+1);
    }
    B.sort();
    let b;
    const n = Math.floor(N/2);
    if(N%2){
        b=B[n];
    }else{
        b=Math.floor((B[n]+B[n-1])/2);
    }
    let ans = 0;
    for(let k of B){
        ans+=Math.abs(k-b);
    }
    console.log(ans);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').split('\n'))