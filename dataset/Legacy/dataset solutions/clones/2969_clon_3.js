const InputParser = (function() {
    class ParserInstance {
        constructor(sourceString) {
            this.sourceLines = sourceString.trim().split("\n");
            this.currentLineIndex = 0;
        }

        // Original 'a' method, reads a single value from the current line
        readNextValue(returnAsStringFlag) {
            let currentLineData = this.sourceLines[this.currentLineIndex];
            let extractedValue;

            // If the current line hasn't been processed into an array of words, split it and reverse for efficient pop()
            if (typeof currentLineData === "string") {
                this.sourceLines[this.currentLineIndex] = currentLineData.split(" ").reverse();
                currentLineData = this.sourceLines[this.currentLineIndex]; // Update reference to the array
            }

            extractedValue = currentLineData.pop(); // Get the last element (which was the first due to reverse)

            // If the current line is now empty, advance to the next line for subsequent reads
            if (currentLineData.length === 0) {
                this.currentLineIndex++;
            }

            return returnAsStringFlag ? extractedValue : +extractedValue;
        }

        // Original 'l' method, reads all values from the current line
        readLineValues(returnAsStringFlag) {
            const lineContent = this.sourceLines[this.currentLineIndex++];
            const splitValues = lineContent.split(" ");
            return returnAsStringFlag ? splitValues : splitValues.map(val => +val);
        }

        // Original 'm' method, reads a matrix of 'numberOfRows' rows
        readMatrix(numberOfRows, returnAsStringFlag) {
            const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numberOfRows);
            this.currentLineIndex += numberOfRows;

            const processedRows = matrixRows.map(row => row.split(" "));
            return returnAsStringFlag ? processedRows : processedRows.map(row => row.map(val => +val));
        }

        // Original 'r' method, reads 'numberOfLines' raw lines
        readRawLines(numberOfLines, returnAsStringFlag) {
            const rawLines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numberOfLines);
            this.currentLineIndex += numberOfLines;
            return returnAsStringFlag ? rawLines : rawLines.map(line => +line);
        }
    }

    // The factory function to create a parser instance
    return function createInputParser(sourceString) {
        return new ParserInstance(sourceString);
    };
})();

const inputReader = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

// Original xArray function, renamed and slightly refactored for clarity, but keeping eval.
function createMultiDimensionalArray(initialValue) {
    const functionArguments = arguments;
    let currentDimensionIndex = functionArguments.length;
    let arrayConstructionString = `Array(functionArguments[${--currentDimensionIndex}]).fill(0).map(element => { return ${initialValue}; })`;

    while (--currentDimensionIndex > 0) {
        arrayConstructionString = `Array(functionArguments[${currentDimensionIndex}]).fill(0).map(element => ${arrayConstructionString})`;
    }
    return eval(arrayConstructionString);
}

console.log(solveProblem());

function solveProblem() {
    const numBits = inputReader.readNextValue(); // Original 'm'
    const targetValue = inputReader.readNextValue(); // Original 'k'

    const totalPossibleValues = 1 << numBits; // Helper variable for 2^m

    // Guard clauses for invalid inputs
    if (targetValue >= totalPossibleValues) {
        return -1;
    }
    // Combined original conditions: k && m === 1
    if (targetValue !== 0 && numBits === 1) {
        return -1;
    }
    if (targetValue === 0) {
        return handleZeroTarget(numBits); // Call renamed f0
    }

    const resultSequence = []; // Original 'ans'
    const loopIterations = totalPossibleValues; // Original 't'

    let currentSequenceValue = 0; // Original 'x'

    // First phase: incrementing sequence
    // Loop runs for (totalPossibleValues - 1) iterations
    for (let iterationIndex = 0; iterationIndex < loopIterations - 1; iterationIndex++) {
        // Original logic: if(x === k)x++; ans.push(x); x++ (from loop header)
        if (currentSequenceValue === targetValue) {
            currentSequenceValue++; // Skip targetValue if it's the current value
        }
        resultSequence.push(currentSequenceValue);
        currentSequenceValue++; // Increment for the next iteration, as per original loop header
    }
    resultSequence.push(targetValue); // Add targetValue at the end of the first phase

    // Second phase: decrementing sequence
    // currentSequenceValue retains its value from the end of the first loop
    for (let iterationIndex = 0; iterationIndex < loopIterations - 1; iterationIndex++) {
        // Original logic: x--; if(x === k)x--; ans.push(x);
        currentSequenceValue--; // Decrement first
        if (currentSequenceValue === targetValue) {
            currentSequenceValue--; // Skip targetValue if it's the current value
        }
        resultSequence.push(currentSequenceValue);
    }
    resultSequence.push(targetValue); // Add targetValue at the end of the second phase

    return resultSequence.join(" ");
}

// Original f0 function, renamed and slightly refactored
function handleZeroTarget(numBits) {
    const sequenceLength = 1 << (numBits + 1); // Original 't'
    const outputArray = new Array(sequenceLength); // Original 'ans', using Array constructor for pre-allocation

    for (let index = 0; index < sequenceLength; index++) { // Original 'i'
        outputArray[index] = index >> 1;
    }
    return outputArray.join(" ");
}
