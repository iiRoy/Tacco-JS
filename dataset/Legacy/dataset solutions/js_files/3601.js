'use strict';

function Main(INPUT) {
    const N = INPUT.split(" ").map(n => Number(n));
    console.log((N[0] - 1) * (N[1] - 1));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
