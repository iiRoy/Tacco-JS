"use strict";

const MOD_CONSTANT = 1000000007;

const computedValuesCache = new Map();

const addWithModulus = (valA, valB) => (valA + valB) % MOD_CONSTANT;

const findCombinationCount = (targetAmount) => {
    if (targetAmount < 0) {
        return 0;
    }
    if (targetAmount === 0) {
        return 1;
    }
    if (targetAmount === 1 || targetAmount === 2) {
        return 0;
    }

    if (computedValuesCache.has(targetAmount)) {
        return computedValuesCache.get(targetAmount);
    }

    const result = addWithModulus(
        findCombinationCount(targetAmount - 3),
        findCombinationCount(targetAmount - 1)
    );

    computedValuesCache.set(targetAmount, result);
    return result;
};

const fileSystemInterface = require("node:fs");
let parsedSegments = [];
let segmentPointer = 0;

const acquireAllSegments = () => {
    const rawContent = fileSystemInterface.readFileSync("/dev/stdin", "utf8");
    parsedSegments = rawContent.trim().split(/\s+/).filter(Boolean);
};

const retrieveNumericSegment = () => {
    return Number(parsedSegments[segmentPointer++]);
};

const runProgramCore = () => {
    acquireAllSegments();
    const desiredValue = retrieveNumericSegment();
    return findCombinationCount(desiredValue);
};

const programOutput = runProgramCore();
if (programOutput !== undefined) {
    console.log(String(programOutput));
}