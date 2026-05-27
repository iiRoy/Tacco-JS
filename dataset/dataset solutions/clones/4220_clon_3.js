function processInputString(inputContent) {
    const lines = inputContent.split("\n");
    const firstLine = lines[0];
    return Number(firstLine);
}

const precomputedResultsMap = new Map([
    [0, "2"],
    [1, "1"],
    [77, "12360848946698171"],
    [78, "20000273725560978"],
    [79, "32361122672259149"],
    [80, "52361396397820127"],
    [81, "84722519070079276"],
    [82, "137083915467899403"],
    [83, "221806434537978679"],
    [84, "358890350005878082"],
    [85, "580696784543856761"],
    [86, "939587134549734843"]
]);

function computeFibonacciLikeSequence(targetIndex) {
    let termNMinus2 = 2;
    let termNMinus1 = 1;
    let currentTerm = 0;

    for (let k = 2; k <= targetIndex; ++k) {
        currentTerm = termNMinus2 + termNMinus1;
        termNMinus2 = termNMinus1;
        termNMinus1 = currentTerm;
    }
    return currentTerm;
}

function main(inputData) {
    const parsedNumber = processInputString(inputData);

    if (precomputedResultsMap.has(parsedNumber)) {
        console.log(precomputedResultsMap.get(parsedNumber));
        return;
    }

    const calculatedValue = computeFibonacciLikeSequence(parsedNumber);
    console.log(calculatedValue);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
