'use strict';

function Main(input) {
    const tmp = input.split("\n")[0].split(" ");
    const A = tmp[0];
    const B = tmp[1];
    const C = tmp[2];

    if (A.slice(-1) == B.slice(0, 1) && B.slice(-1) == C.slice(0, 1)) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
