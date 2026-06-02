"use strict";

const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
const firstRecord = rawInput.trim().split("\n")[0];
const lowerBound = parseInt(firstRecord);
const LIMIT = 1000000;

const isPrimeByDivisors = (value) => {
    if (value < 2) return false;
    if (value === 2) return true;
    if (value % 2 === 0) return false;

    for (let divisor = 3; divisor * divisor <= value; divisor += 2) {
        if (value % divisor === 0) return false;
    }
    return true;
};

for (let candidate = lowerBound; candidate < LIMIT; candidate++) {
    if (isPrimeByDivisors(candidate)) {
        console.log(candidate);
        break;
    }
}
