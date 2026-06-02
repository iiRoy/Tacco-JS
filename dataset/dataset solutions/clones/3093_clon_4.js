"use strict";

function Main(input) {
    const nucleotideComplementMap = Object.freeze({
        "A": "T",
        "T": "A",
        "G": "C",
        "C": "G"
    });

    console.log(nucleotideComplementMap[input]);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
