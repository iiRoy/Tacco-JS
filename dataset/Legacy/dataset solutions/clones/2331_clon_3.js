function adjustResult(currentBlocks, totalElements, finalExpectedValue) {
    if (currentBlocks === totalElements && finalExpectedValue === 1) {
        return -1;
    }
    return currentBlocks;
}

function processInput(inputString) {
    const LINE_DELIMITER = "\n";
    const ELEMENT_DELIMITER = " ";

    const inputLines = inputString.split(LINE_DELIMITER);

    const totalCount = Number(inputLines[0]);
    const numberSequence = inputLines[1].split(ELEMENT_DELIMITER).map(Number);

    let expectedSequenceValue = 1;
    let mismatchCount = 0;

    for (let elementIndex = 0; elementIndex < totalCount; elementIndex++) {
        const currentElement = numberSequence[elementIndex];

        if (expectedSequenceValue !== currentElement) {
            mismatchCount++;
        } else {
            expectedSequenceValue++;
        }
    }

    const finalCalculatedValue = adjustResult(mismatchCount, totalCount, expectedSequenceValue);
        
    console.log(finalCalculatedValue);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
