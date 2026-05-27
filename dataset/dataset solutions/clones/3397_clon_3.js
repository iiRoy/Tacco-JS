"use strict";

const InputReader = (function() {
    const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const inputTokens = rawInputContent.split(/ |\n/);
    let currentTokenPosition = 0;

    const convertToNumber = (str) => +str;
    const convertToBigInt = (str) => BigInt(str);

    return {
        readInteger: () => convertToNumber(inputTokens[currentTokenPosition++]),
        readString: () => inputTokens[currentTokenPosition++],
        readBigInteger: () => convertToBigInt(inputTokens[currentTokenPosition++]),

        readIntegerSequence: (count) => {
            const sequence = [];
            for (let i = 0; i < count; i++) {
                sequence.push(convertToNumber(inputTokens[currentTokenPosition++]));
            }
            return sequence;
        },

        readStringSequence: (count) => {
            const sequence = [];
            for (let i = 0; i < count; i++) {
                sequence.push(inputTokens[currentTokenPosition++]);
            }
            return sequence;
        },

        readNumberMatrix: (rows, cols, returnStrings = false) => {
            const matrix = [];
            for (let r = 0; r < rows; r++) {
                const row = [];
                for (let c = 0; c < cols; c++) {
                    row.push(returnStrings ? inputTokens[currentTokenPosition++] : convertToNumber(inputTokens[currentTokenPosition++]));
                }
                matrix.push(row);
            }
            return matrix;
        },

        // Original xArray equivalent, kept as is due to eval for behavioral equivalence
        createMultiDimensionalArray: function(initialValue) {
            var args = arguments, argLength = args.length, evalExpression = "Array(args[" + --argLength + "]).fill().map(x=>{return " + initialValue + ";})";
            while (--argLength) evalExpression = "Array(args[" + argLength + "]).fill().map(x=>" + evalExpression + ")";
            return eval(evalExpression);
        }
    };
})();

const finalResult = processSolution();
if (finalResult !== undefined) {
    console.log(String(finalResult));
}

function processSolution() {
    const dataSize = InputReader.readInteger();
    const dataValues = InputReader.readIntegerSequence(dataSize);

    let searchUpperBoundary = dataSize; // Corresponds to 'ok'
    let searchLowerBoundary = 0;        // Corresponds to 'ng'

    while (searchUpperBoundary - searchLowerBoundary > 1) {
        const currentMidpoint = (searchUpperBoundary + searchLowerBoundary) >> 1; // Corresponds to 'm'
        let isFeasible = true;                                                    // Corresponds to 'f'
        const processingStack = [];                                               // Corresponds to 'b'

        // Initialize processingStack based on the first element of dataValues
        if (dataValues[0] > 1) {
            processingStack.push(1, 1, dataValues[0], 1);
        } else {
            processingStack.push(1, 1);
        }

        for (let elementIndex = 1; elementIndex < dataSize && isFeasible; elementIndex++) {
            const currentDataElement = dataValues[elementIndex];
            let stackSecondToLastElement = processingStack[processingStack.length - 2];

            if (stackSecondToLastElement < currentDataElement) {
                // Trim stack: remove pairs where the count is 1, if stack has more than 2 elements
                while (processingStack.length > 2 && processingStack[processingStack.length - 1] === 1) {
                    processingStack.pop(); // Remove count
                    processingStack.pop(); // Remove value
                }
                processingStack.push(currentDataElement, 1);
            } else {
                // Condition not met, further checks needed
                if (currentMidpoint === 1) {
                    isFeasible = false;
                    break;
                }

                // Pop elements from stack until stackSecondToLastElement is not greater than currentDataElement
                while (processingStack[processingStack.length - 2] > currentDataElement) {
                    processingStack.pop(); // Remove count
                    processingStack.pop(); // Remove value
                }

                stackSecondToLastElement = processingStack[processingStack.length - 2]; // Re-fetch after potential pops

                if (stackSecondToLastElement < currentDataElement) {
                    processingStack.push(currentDataElement, 2);
                } else {
                    let currentComparisonThreshold = stackSecondToLastElement; // Corresponds to 't'
                    let stackTraversalPointer = processingStack.length - 1;    // Corresponds to 'j'

                    for (; stackTraversalPointer > 0; stackTraversalPointer -= 2) {
                        const traversedValue = processingStack[stackTraversalPointer - 1];
                        const traversedCount = processingStack[stackTraversalPointer];

                        if (traversedValue < currentComparisonThreshold) {
                            processingStack.push(currentDataElement, 2);
                            break;
                        }
                        if (traversedCount < currentMidpoint) {
                            processingStack[stackTraversalPointer]++;
                            if (traversedValue < currentDataElement) {
                                processingStack.push(currentDataElement, 1);
                            }
                            break;
                        }
                        processingStack.pop(); // Remove count
                        processingStack.pop(); // Remove value
                        currentComparisonThreshold--;
                    }
                    if (stackTraversalPointer < 0) {
                        isFeasible = false;
                    }
                }
            }
        }

        if (isFeasible) {
            searchUpperBoundary = currentMidpoint;
        } else {
            searchLowerBoundary = currentMidpoint;
        }
    }
    return searchUpperBoundary;
}
