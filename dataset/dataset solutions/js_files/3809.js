'use strict';

const DELIMITER = " ";
const A_INDEX = 0;
const B_INDEX = 1;
const C_INDEX = 2;
const K_INDEX = 3;

const process = input => {
    const indexArr = input.split(DELIMITER);
    let a = parseInt(indexArr[A_INDEX]);
    let b = parseInt(indexArr[B_INDEX]);
    let c = parseInt(indexArr[C_INDEX]);
    let ans = a - b;
    const K = parseInt(indexArr[K_INDEX]);

    console.log(K % 2 === 0 ? ans : -ans);
}

process(require("fs").readFileSync("/dev/stdin", "utf8"));