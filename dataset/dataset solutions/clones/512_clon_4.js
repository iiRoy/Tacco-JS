process.stdin.resume();
process.stdin.setEncoding('utf8');

const processInputData = (incomingData) => {
    const allInputLines = incomingData.trim().split("\n");
    let currentLinePointer = 0;

    const obtainDifferenceValue = (targetIndex, numberSequence, sequenceCount) => {
        if (targetIndex < 1 || targetIndex > sequenceCount) {
            return undefined;
        }
        if (targetIndex === sequenceCount) {
            // Original code: parseInt(dataset[n]) - parseInt(dataset[n-1])
            // dataset[n] is undefined, parseInt(undefined) is NaN.
            // NaN - anyNumber is NaN. This replicates that behavior.
            return NaN;
        }
        return numberSequence[targetIndex] - numberSequence[targetIndex - 1];
    };

    const determineOutlierIndex = (numericSequence, sequenceCount) => {
        const decisionPathways = [
            {
                // Original Case 1: map[1] === map[2] && map[2] === map[3] && map[3] === map[4]
                condition: (seq, count) => {
                    const diffA = obtainDifferenceValue(1, seq, count);
                    const diffB = obtainDifferenceValue(2, seq, count);
                    const diffC = obtainDifferenceValue(3, seq, count);
                    const diffD = obtainDifferenceValue(4, seq, count);
                    return diffA === diffB && diffB === diffC && diffC === diffD;
                },
                action: (seq, count) => {
                    const commonDifference = obtainDifferenceValue(1, seq, count);
                    let checkPosition = 5;
                    while (checkPosition <= count) {
                        const currentDifference = obtainDifferenceValue(checkPosition, seq, count);
                        if (currentDifference !== commonDifference) {
                            break;
                        }
                        checkPosition++;
                    }
                    return checkPosition;
                }
            },
            {
                // Original Case 2: map[2] === map[3] && map[3] === map[4]
                condition: (seq, count) => {
                    const diffB = obtainDifferenceValue(2, seq, count);
                    const diffC = obtainDifferenceValue(3, seq, count);
                    const diffD = obtainDifferenceValue(4, seq, count);
                    return diffB === diffC && diffC === diffD;
                },
                action: () => 0
            },
            {
                // Original Case 3: map[1] === map[2] && map[2] === map[3]
                condition: (seq, count) => {
                    const diffA = obtainDifferenceValue(1, seq, count);
                    const diffB = obtainDifferenceValue(2, seq, count);
                    const diffC = obtainDifferenceValue(3, seq, count);
                    return diffA === diffB && diffB === diffC;
                },
                action: () => 4
            },
            {
                // Original Case 4: parseInt(dataset[2]) - parseInt(dataset[0]) === map[3] && map[3] === map[4]
                condition: (seq, count) => {
                    const val2_val0_diff = seq[2] - seq[0];
                    const diffC = obtainDifferenceValue(3, seq, count);
                    const diffD = obtainDifferenceValue(4, seq, count);
                    return val2_val0_diff === diffC && diffC === diffD;
                },
                action: () => 1
            },
            {
                // Original Case 5: map[1] === map[2] && map[2] === parseInt(dataset[4]) - parseInt(dataset[2])
                condition: (seq, count) => {
                    const diffA = obtainDifferenceValue(1, seq, count);
                    const diffB = obtainDifferenceValue(2, seq, count);
                    const val4_val2_diff = seq[4] - seq[2];
                    return diffA === diffB && diffB === val4_val2_diff;
                },
                action: () => 3
            },
            {
                // Original Case 6: map[1] === parseInt(dataset[3]) - parseInt(dataset[1]) && map[1] === map[4]
                condition: (seq, count) => {
                    const diffA = obtainDifferenceValue(1, seq, count);
                    const val3_val1_diff = seq[3] - seq[1];
                    const diffD = obtainDifferenceValue(4, seq, count);
                    return diffA === val3_val1_diff && diffA === diffD;
                },
                action: () => 2
            }
        ];

        for (const pathway of decisionPathways) {
            if (pathway.condition(numericSequence, sequenceCount)) {
                return pathway.action(numericSequence, sequenceCount);
            }
        }
        return -1; // Should not be reached based on problem structure
    };

    while (currentLinePointer < allInputLines.length) {
        const currentLineContent = allInputLines[currentLinePointer];
        const currentSequenceCount = parseInt(currentLineContent);
        currentLinePointer++;

        if (currentSequenceCount === 0) {
            break;
        }

        const rawStringNumbers = allInputLines[currentLinePointer].trim().split(" ");
        currentLinePointer++;

        const parsedNumericSequence = rawStringNumbers.map(Number);

        const identifiedOutlierIndex = determineOutlierIndex(parsedNumericSequence, currentSequenceCount);
        console.log(rawStringNumbers[identifiedOutlierIndex]);
    }
};

process.stdin.on('data', processInputData);
