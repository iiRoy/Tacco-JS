"use strict";
function Main(input) {
    let lines = input.split("\n");
    let N = lines[0] - 0;
    let sum = 0;
    for (let n = 1; n <= N; n++) {
        let xv = lines[n].split(/\s/);
        let x = xv[0] - 0;
        sum += (xv[1] == 'BTC') ? x * 380000.0 : x;
    }

    console.log(sum);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
