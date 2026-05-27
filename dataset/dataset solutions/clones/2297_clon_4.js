"use strict";

class InputSource {
    constructor() {
        this.dataLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
        this.currentPosition = 0;
        this.totalLines = this.dataLines.length;
    }

    hasMoreEntries() {
        return this.currentPosition < this.totalLines;
    }

    pullEntry() {
        if (!this.hasMoreEntries()) {
            throw "ArrayIndexOutOfBoundsException";
        }
        return this.dataLines[this.currentPosition++];
    }

    fetchInteger() {
        return parseInt(this.pullEntry());
    }

    fetchStringArray() {
        return this.pullEntry().split(" ");
    }

    fetchIntegerArray() {
        return this.pullEntry().split(" ").map(val => parseInt(val));
    }

    fetchCharacterArray() {
        return this.pullEntry().split("");
    }
}

const inputProcessor = new InputSource();
const outputResult = (...items) => console.log(...items);

const executePrimeFinder = () => {
    const startValue = inputProcessor.fetchInteger();
    const upperLimit = 1000000;

    const compositeNumbers = new Set([0, 1]);

    for (let num = 4; num < upperLimit; num += 2) {
        compositeNumbers.add(num);
    }

    for (let currentCandidate = 3; currentCandidate * currentCandidate < upperLimit; currentCandidate += 2) {
        if (!compositeNumbers.has(currentCandidate)) {
            for (let multiple = currentCandidate * currentCandidate; multiple < upperLimit; multiple += currentCandidate * 2) {
                compositeNumbers.add(multiple);
            }
        }
    }

    for (let searchNum = startValue; searchNum < upperLimit; searchNum++) {
        if (!compositeNumbers.has(searchNum)) {
            outputResult(searchNum);
            return;
        }
    }
};

executePrimeFinder();
