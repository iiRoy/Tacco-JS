function processAllCases(rawInputText) {
    const inputLines = rawInputText.split("\n");
    let currentLineIndex = 0;

    while (currentLineIndex < inputLines.length) {
        const numElementsStr = inputLines[currentLineIndex];
        if (!numElementsStr || numElementsStr.trim() === '') {
            currentLineIndex++;
            continue;
        }

        const numElements = parseInt(numElementsStr);
        if (isNaN(numElements) || numElements < 1 || currentLineIndex + 1 >= inputLines.length) {
            currentLineIndex++;
            continue;
        }

        const elementString = inputLines[currentLineIndex + 1];
        const initialElements = elementString.split("").map(Number);

        const finalValue = calculateFinalDifference(initialElements);
        console.log(finalValue);

        currentLineIndex += 2;
    }
}

function calculateFinalDifference(currentElements) {
    if (currentElements.length === 1) {
        return currentElements[0];
    }

    const nextRow = generateNextDifferenceRow(currentElements);
    const reducedRow = nextRow.slice(0, nextRow.length - 1);

    return calculateFinalDifference(reducedRow);
}

function generateNextDifferenceRow(sequence) {
    if (sequence.length < 2) {
        return sequence;
    }

    const adjacentDifferences = sequence.slice(0, sequence.length - 1)
                                        .map((value, index) => Math.abs(value - sequence[index + 1]));

    const lastComputedElement = Math.abs(sequence[sequence.length - 1] - adjacentDifferences[0]);

    return adjacentDifferences.concat([lastComputedElement]);
}

processAllCases(require("fs").readFileSync("/dev/stdin", "utf8"));