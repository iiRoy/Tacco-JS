"use strict";

function ProcessInput(rawData) {
    const dataLines = rawData.split("\n");

    const [sequenceLength, flipCount] = dataLines[0].split(/\s/).map(Number);

    const digitSequence = dataLines[1].split(/\s/)[0].split("").map(Number);

    let blockSequence = digitSequence.reduce((accumulator, currentDigit, index) => {
        if (index === 0) {
            accumulator.push({ blockType: currentDigit, blockLength: 1 });
        } else {
            let lastSegment = accumulator[accumulator.length - 1];
            if (lastSegment.blockType === currentDigit) {
                lastSegment.blockLength++;
            } else {
                accumulator.push({ blockType: currentDigit, blockLength: 1 });
            }
        }
        return accumulator;
    }, []);

    if (blockSequence.length > 0 && blockSequence[0].blockType === 0) {
        blockSequence.unshift({ blockType: 1, blockLength: 0 });
    }

    const segmentsToSum = blockSequence.slice(0, flipCount * 2 + 1);
    const finalSum = segmentsToSum.reduce((total, segment) => total + segment.blockLength, 0);

    console.log(finalSum);
}

if (typeof window === "undefined") {
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
