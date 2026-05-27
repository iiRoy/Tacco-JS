'use strict';

function processInput(rawVal) {
    const parsedVal = Number.parseInt(rawVal.trim(), 10);

    if (parsedVal < 1) {
        return;
    }

    const rootCandidate = Math.floor(Math.sqrt(parsedVal));
    const largestPerfectSquare = rootCandidate * rootCandidate;

    console.log('%d', largestPerfectSquare);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
