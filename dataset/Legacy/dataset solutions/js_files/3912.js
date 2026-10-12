'use strict';

function Main(INPUT) {
    const S = INPUT.split("");
    console.log(S[0] != S[1] && S[0] != S[2] && S[1] != S[2] ? "Yes" : "No");
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
