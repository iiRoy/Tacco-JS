"use strict"

const main = (input) => {
    const _input = input.split(' ');
    const A = parseInt(_input[0], 10);
    const B = parseInt(_input[1], 10);
    const C = parseInt(_input[2], 10);

    const sum = B + C;
    if(sum > A){
        const remaining = sum - A;
        console.log(remaining);
    } else {
        console.log(0);
    }
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));