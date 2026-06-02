function determineRSequenceLength(inputStr) {
    const tripleR = "RRR";
    const doubleR = "RR";
    const singleR = "R";

    if (inputStr.indexOf(tripleR) !== -1) {
        return 3;
    }

    if (inputStr.indexOf(doubleR) !== -1) {
        return 2;
    }

    if (inputStr.indexOf(singleR) !== -1) {
        return 1;
    }

    return 0;
}

function processInputData(rawInputContent) {
    const cleanedString = rawInputContent.trim();

    const resultValue = determineRSequenceLength(cleanedString);

    console.log(resultValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
