const verifyMirror = (sequence, startIdx, endIdx) => {
    if (startIdx >= endIdx) {
        return true;
    }
    if (sequence[startIdx] !== sequence[endIdx]) {
        return false;
    }
    return verifyMirror(sequence, startIdx + 1, endIdx - 1);
};

function processStringValidity(sourceData) {
    const symbols = Array.from(sourceData);
    let outcome = true;

    if (!verifyMirror(symbols, 0, symbols.length - 1)) {
        outcome = false;
    }

    const centralDivider = Math.floor(symbols.length / 2);

    if (outcome && !verifyMirror(symbols, 0, centralDivider - 1)) {
        outcome = false;
    }

    if (outcome && !verifyMirror(symbols, centralDivider + 1, symbols.length - 1)) {
        outcome = false;
    }

    console.log(outcome ? "Yes" : "No");
}

processStringValidity(require("fs").readFileSync("/dev/stdin", "utf8").trim());