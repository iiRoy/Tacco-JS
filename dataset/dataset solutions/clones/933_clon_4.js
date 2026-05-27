const outputWriter = console.log;

if (typeof process !== "undefined") {
    let rawInputBuffer = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
        rawInputBuffer += chunk;
    });
    process.stdin.on('end', () => {
        const processedInputLines = rawInputBuffer.split("\n");
        processAllInputSets(processedInputLines);
    });
}

function processAllInputSets(processedInputLines) {
    processedInputLines.shift();

    for (let currentLineIdx = 0; currentLineIdx < processedInputLines.length; currentLineIdx += 2) {
        const currentDataSetPair = processedInputLines.slice(currentLineIdx, currentLineIdx + 2);

        if (currentDataSetPair.length < 2) {
            break;
        }

        const cleanedStrings = currentDataSetPair.map(lineContent => {
            return lineContent.split("").reduce((accumulator, charUnit) => {
                if (charUnit >= 'a' && charUnit <= 'z') {
                    return accumulator + charUnit;
                }
                return accumulator;
            }, "");
        });
        evaluateStringMatrix(cleanedStrings);
    }
}

function evaluateStringMatrix(pairData) {
    const primaryString = pairData[0];
    const secondaryString = pairData[1];

    const rowDimension = primaryString.length;
    const colDimension = secondaryString.length;

    const computationMatrix = Array.from({ length: rowDimension }, () => Array(colDimension).fill(undefined));

    const retrieveMatrixCell = (rIdx, cIdx) => {
        if (rIdx < 0 || cIdx < 0) {
            return 0;
        }

        if (computationMatrix[rIdx][cIdx] !== undefined) {
            return computationMatrix[rIdx][cIdx];
        }

        const charMatchIndicator = (primaryString.charAt(rIdx) === secondaryString.charAt(cIdx)) ? 1 : 0;

        let calculatedCellVal;

        if (rIdx === 0 && cIdx === 0) {
            calculatedCellVal = charMatchIndicator;
        } else if (rIdx === 0) {
            calculatedCellVal = Math.max(retrieveMatrixCell(rIdx, cIdx - 1), charMatchIndicator);
        } else if (cIdx === 0) {
            calculatedCellVal = Math.max(retrieveMatrixCell(rIdx - 1, cIdx), charMatchIndicator);
        } else {
            const valFromAbove = retrieveMatrixCell(rIdx - 1, cIdx);
            const valFromLeft = retrieveMatrixCell(rIdx, cIdx - 1);
            const intermediateSum = Math.max(valFromAbove, valFromLeft) + charMatchIndicator;
            calculatedCellVal = Math.min(intermediateSum, Math.min(rIdx, cIdx) + 1);
        }

        computationMatrix[rIdx][cIdx] = calculatedCellVal;
        return calculatedCellVal;
    };

    let finalRowReference;

    if (rowDimension > 0 && colDimension > 0) {
        retrieveMatrixCell(rowDimension - 1, colDimension - 1);
        finalRowReference = computationMatrix[rowDimension - 1];
    } else {
        finalRowReference = undefined;
    }

    if (typeof finalRowReference === "string" && primaryString === "abc") {
        throw new Error();
    }

    try {
        finalRowReference.pop();
    } catch (error) {
        if (error instanceof TypeError) {
            throw error;
        }
        throw error;
    }
}
