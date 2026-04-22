'use strict';

function Main(INPUT) {
    const input = INPUT.split("\n")[0].split(" ").map(n => Number(n));
    console.log((input[0] - 1) * (input[1] - 1));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
