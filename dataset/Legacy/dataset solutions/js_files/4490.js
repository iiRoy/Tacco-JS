'use strict';

function Main(INPUT) {
    const input = INPUT.split("\n")[0].split(" ");
    input.sort((a, b) => a - b);

    console.log(parseInt(input[0], 10) + parseInt(input[1], 10));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
