"use strict";
function Main(input) {
    let lines = input.split("\n");
    let Ln = lines.shift().split(/\s/).map((v) => v - 0);
    let A = Ln[0], B = Ln[1];
    let ans = 0;
    if (A == B) ans = A;
    else if ((A + B) % 2 == 0) ans = (A ^ B) - 1;
    else ans = A ^ B;
    console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
