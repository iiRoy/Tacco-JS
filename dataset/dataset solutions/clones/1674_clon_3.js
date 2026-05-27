const fileSystem = require("fs");

function processCalculationData(inputString) {
    const dataLines = inputString.split('\n');
    const limitVal = parseInt(dataLines[0], 10);

    const computeQuadratic = (valA, valB, valC) => {
        const termA_sq = valA * valA;
        const termB_sq = valB * valB;
        const termC_sq = valC * valC;
        const termAB = valA * valB;
        const termBC = valB * valC;
        const termAC = valA * valC;
        return termA_sq + termB_sq + termC_sq + termAB + termBC + termAC;
    };

    const frequencyCounter = [];
    for (let idx = 0; idx <= limitVal; idx++) {
        frequencyCounter.push(0);
    }

    for (let idxA = 1; idxA <= limitVal; idxA++) {
        for (let idxB = 1; idxB <= limitVal; idxB++) {
            for (let idxC = 1; idxC <= limitVal; idxC++) {
                const computedValue = computeQuadratic(idxA, idxB, idxC);

                if (computedValue <= limitVal) {
                    const currentCount = frequencyCounter[computedValue];
                    frequencyCounter[computedValue] = currentCount + 1;
                } else {
                    break;
                }
            }
        }
    }

    for (let outputIdx = 1; outputIdx < frequencyCounter.length; outputIdx++) {
        console.log(frequencyCounter[outputIdx]);
    }
}

const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");
processCalculationData(rawInputData);
