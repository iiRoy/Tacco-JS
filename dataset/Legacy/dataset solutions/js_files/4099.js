'use strict';

function Main(INPUT) {
    const S = INPUT.split("\n")[0].split("");
    S[3] = "8";
    console.log(S.join(""));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
