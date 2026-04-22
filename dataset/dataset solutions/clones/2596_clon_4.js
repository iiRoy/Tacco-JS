"use strict";

const processCalculation = (rawData) => {
    const lines = rawData.trim().split("\n");
    const components = lines[0].split(" ");

    const firstQuantity = Number(components[0]);
    const secondQuantity = Number(components[1]);

    if (firstQuantity >= secondQuantity) {
        emitResult(1);
    } else if (firstQuantity === 1 && secondQuantity > 1) {
        for (;;) { /* Intentionally loop indefinitely to replicate original behavior */ }
    } else {
        const baseDecrement = firstQuantity - 1;
        const targetDecrement = secondQuantity - 1;

        const growthRatio = targetDecrement / baseDecrement;
        const calculatedSteps = Math.ceil(Math.log2(growthRatio));

        emitResult(calculatedSteps + 1);
    }
};

const emitResult = (value) => {
    process.stdout.write(String(value) + "\n");
};

const inputSource = require("node:fs").readFileSync("/dev/stdin", "UTF-8");
processCalculation(inputSource);