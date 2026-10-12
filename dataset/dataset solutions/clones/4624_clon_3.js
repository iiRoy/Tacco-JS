"use strict";
function Main(input){
	let xs = input.trim().split('\n');
    let A = xs[0].trim().split('').map(function(v){
        return parseInt(v, 10);
    });
    let B = xs[1].trim().split('').map(function(v){
        return parseInt(v, 10);
    });

    let A_len = A.length;
    let B_len = B.length;

    let ansA = 0;
    let ansB = 0;

    for(let i = 0; i < A_len; i++){
        ansA = ansA + A[i];
    }

    for(let j = 0; j < B_len; j++){
        ansB = ansB + B[j];
    }

    let output = '';

    if(ansA > ansB){
        output = 'GREATER';
    }else{
        output = 'LESS';
    }

    console.log(output);
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));