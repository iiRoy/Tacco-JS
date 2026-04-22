'use strict';

function Main(input) {
    const tmp = input.split("\n")[0].split(" ");
    const a = tmp[0];
    const b = tmp[1]:

    if (a == b) {
        console.log("H");
    } else {
        console.log("D");
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
