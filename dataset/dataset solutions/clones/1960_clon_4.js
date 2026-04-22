'use strict';

const calculatePerimeter = (incomingData) => {
    const numericPartExtractor = /^(-?\d+)/;
    const extractedNumericString = incomingData.match(numericPartExtractor);

    if (!extractedNumericString || extractedNumericString.length === 0) {
        throw new Error("Input string does not contain a valid leading integer.");
    }

    const baseDimension = parseFloat(extractedNumericString[0]);

    const circularRatio = Math.acos(-1);

    const doubleValue = (val) => {
        return val + val;
    };

    const totalBoundaryLength = doubleValue(baseDimension * circularRatio);

    return totalBoundaryLength;
};

const rawContentFromSource = require("fs").readFileSync("/dev/stdin", "utf8");

const finalOutputValue = calculatePerimeter(rawContentFromSource);

process.stdout.write(finalOutputValue.toString() + '\n');