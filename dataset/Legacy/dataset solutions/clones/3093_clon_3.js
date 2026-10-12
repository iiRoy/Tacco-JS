"use strict";

function processInput(charInput) {
    let complementChar;

    const dnaComplementMap = {
        "A": "T",
        "T": "A",
        "G": "C",
        "C": "G"
    };

    complementChar = dnaComplementMap[charInput];

    console.log(complementChar);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
