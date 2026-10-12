"use strict";

const A_INDEX = 0;
const B_INDEX = 1;
const K_INDEX = 3;
const LIMIT = Math.pow(10, 18);

const main = arg => {
    const indexArr = arg.trim().split("\n");
    const ans = parseInt(indexArr[A_INDEX]) - parseInt(indexArr[B_INDEX]);
    const KString = indexArr[K_INDEX];
    const K = parseInt(KString.charAt(KString.length-1));

    if (Math.abs(ans) > LIMIT) {
        console.log("Unfair")
    } else {
        console.log(K % 2 === 0 || ans === 0 ? ans : -ans);
    }
}

main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
