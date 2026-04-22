"use strict";

const acquireData = () => {
    const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const lines = rawContent.trim().split("\n");
    return lines;
};

const executeProgram = () => {
    const allInputLines = acquireData();

    const initialLineValue = parseInt(allInputLines.shift(), 10);

    const outcomeTallies = new Map();
    outcomeTallies.set("AC", 0);
    outcomeTallies.set("WA", 0);
    outcomeTallies.set("TLE", 0);
    outcomeTallies.set("RE", 0);

    allInputLines.forEach(currentOutcome => {
        if (outcomeTallies.has(currentOutcome)) {
            outcomeTallies.set(currentOutcome, outcomeTallies.get(currentOutcome) + 1);
        }
    });

    const displayResults = (category, count) => {
        console.log(`${category} x ${count}`);
    };

    displayResults("AC", outcomeTallies.get("AC"));
    displayResults("WA", outcomeTallies.get("WA"));
    displayResults("TLE", outcomeTallies.get("TLE"));
    displayResults("RE", outcomeTallies.get("RE"));
};

executeProgram();