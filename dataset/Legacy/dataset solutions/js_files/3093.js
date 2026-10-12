"use strict";

function Main(input) {
    let answer;

    switch (input) {
        case "A":
            answer = "T";
            break;
        case "T":
            answer = "A";
            break;
        case "G":
            answer = "C";
            break;
        case "C":
            answer = "G";
            break;
    }

    console.log(answer);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
