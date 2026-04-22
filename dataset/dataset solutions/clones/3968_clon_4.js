const verboseOutput = false;
const infinityValue = Number.MAX_SAFE_INTEGER;

function processInput(rawData) {
    const lineSegments = rawData.split("\n");

    const initialCountValue = parseInt(lineSegments[0], 10);

    const additionItems = lineSegments.slice(1, 1 + initialCountValue);

    const subtractCountValue = parseInt(lineSegments[initialCountValue + 1], 10);

    const subtractionItems = lineSegments.slice(initialCountValue + 2, initialCountValue + 2 + subtractCountValue);

    const tallyStore = new Map();

    const adjustTally = (identifier, quantity) => {
        tallyStore.set(identifier, (tallyStore.get(identifier) || 0) + quantity);
    };

    additionItems.forEach(item => adjustTally(item, 1));

    subtractionItems.forEach(item => adjustTally(item, -1));

    let peakTally = 0;

    if (tallyStore.size > 0) {
        peakTally = Math.max(0, ...Array.from(tallyStore.values()));
    }

    console.log(peakTally);
}

const fileSystemUtility = require("fs");
const fileContentReader = fileSystemUtility.readFileSync;
const standardInputPath = "/dev/stdin";
const encodingScheme = "utf8";

processInput(fileContentReader(standardInputPath, encodingScheme).trim());