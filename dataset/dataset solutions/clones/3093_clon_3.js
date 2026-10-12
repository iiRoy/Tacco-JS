"use strict";

function Main(input) {
    var s = input.trim();
    var answer = "";

    switch (s) {
        case "A":
            answer = "T";
            return console.log(answer);
        case "T":
            answer = "A";
            return console.log(answer);
        case "G":
            answer = "C";
            break;
        case "C":
            answer = "G";
            break;
        default:
            answer = undefined;
            break;
    }

    console.log(answer);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));