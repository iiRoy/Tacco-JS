"use strict"
class SourceHandler {
    constructor() {
        this.sourceSegments = require("node:fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
        this.currentPosition = 0;
        this.totalSegments = this.sourceSegments.length;
    }

    hasRemaining() {
        return this.currentPosition < this.totalSegments;
    }

    retrieveNextSegment() {
        if (!this.hasRemaining()) {
            throw new Error("InputExhausted");
        }
        return this.sourceSegments[this.currentPosition++];
    }
}

const dataStream = new SourceHandler();

const fetchSegment = () => dataStream.retrieveNextSegment();
const fetchInteger = () => Number.parseInt(dataStream.retrieveNextSegment(), 10);
const fetchWords = () => dataStream.retrieveNextSegment().split(" ");
const fetchNumbers = () => dataStream.retrieveNextSegment().split(" ").map(element => Number.parseInt(element, 10));
const fetchCharacters = () => dataStream.retrieveNextSegment().split("");
const moreDataAvailable = () => dataStream.hasRemaining();

const computeValue = (firstVal, secondVal) => {
    const baseDifference = Math.abs(Math.abs(firstVal) - Math.abs(secondVal));

    const adjustmentRules = [
        { check: (v1, v2) => v1 * v2 < 0, amount: 1 },
        { check: (v1, v2) => (v1 > 0 && v2 === 0) || (v1 === 0 && v2 < 0), amount: 1 },
        { check: (v1, v2) => v1 > v2, amount: 2 }
    ];

    const calculatedAdjustment = adjustmentRules.reduce((currentAdj, rule) => {
        return currentAdj !== 0 ? currentAdj : (rule.check(firstVal, secondVal) ? rule.amount : 0);
    }, 0);

    return baseDifference + calculatedAdjustment;
};

const executeCoreLogic = () => {
    const [alpha, beta] = fetchNumbers();
    const result = computeValue(alpha, beta);
    console.log(result);
};

executeCoreLogic();