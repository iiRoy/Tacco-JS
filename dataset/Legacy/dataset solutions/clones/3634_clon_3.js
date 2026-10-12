const LOWER_BOUND_ABC_THRESHOLD = 1200;
const UPPER_BOUND_ARC_THRESHOLD = 2800;
const MAX_AGC_VALUE = 4208;

function processInputData(rawDataString) {
    const parsedNumericValue = Number(rawDataString);

    const shouldOutputABC = parsedNumericValue < LOWER_BOUND_ABC_THRESHOLD;
    if (shouldOutputABC) {
        console.log('ABC');
    }

    const shouldOutputARC = parsedNumericValue >= LOWER_BOUND_ABC_THRESHOLD && parsedNumericValue < UPPER_BOUND_ARC_THRESHOLD;
    if (shouldOutputARC) {
        console.log('ARC');
    }

    const shouldOutputAGC = parsedNumericValue <= MAX_AGC_VALUE;
    if (shouldOutputAGC) {
        console.log('AGC');
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
