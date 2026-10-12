"use strict";
function Main(input) {
    let lines = input.split("\n");
    let S = lines.shift().trim();
    let K = lines.shift().trim();
    for (let i = 0; i < K && i < S.length; i++) {
        if (S.charAt(i) != 1) {
            console.log(S.charAt(i));
            return;
        }
    }
    console.log(S.charAt(K));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));