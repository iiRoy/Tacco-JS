var computeResults = function() {
    const INITIAL_MIN_VAL = 1073741824; // Equivalent to 1 << 30
    let inputLineData;

    while (true) {
        let currentLine = fetchNextLine();
        if (currentLine === null) { // Handle end of input gracefully if not handled by 'end' event
            break;
        }
        inputLineData = currentLine.split(' ').map(Number);

        let firstNum = inputLineData[0];

        if (firstNum === 0) { // Guard clause for loop termination condition
            break;
        }

        let secondNum = inputLineData[1];
        let minDiffResult = INITIAL_MIN_VAL;

        // Small helper function for the core calculation
        const calculateHypotDiff = (idx, valA, valB) => {
            return Math.abs(valB - Math.hypot(idx, valA - idx));
        };

        // Explicitly use Math.floor for integer division, equivalent to `^0` for positive numbers
        let loopUpperLimit = Math.floor(firstNum / 2);

        for (let loopIndex = 0; loopIndex <= loopUpperLimit; loopIndex++) {
            minDiffResult = Math.min(minDiffResult, calculateHypotDiff(loopIndex, firstNum, secondNum));
        }
        outputValue(minDiffResult);
    }
};

// Input/Output Handling Module
if (typeof process !== 'undefined') {
    // Node.js environment specific implementation
    const outputValue = function(val) {
        console.log(val);
    };

    const fetchNextLine = (function() {
        let inputBuffer = [];
        let bufferIndex = 0;
        const standardInput = process.openStdin();
        standardInput.setEncoding('utf8');

        let partialInputString = "";

        // Helper function to process incoming data chunks
        const processInputChunk = (chunk) => {
            let lineSegments = (partialInputString + chunk).split("\n");
            partialInputString = lineSegments.pop(); // Keep the last fragment
            for (let i = 0; i < lineSegments.length; i++) {
                if (lineSegments[i] === '') { // Skip truly empty lines
                    continue;
                }
                inputBuffer.push(lineSegments[i]);
            }
        };

        standardInput.on('data', processInputChunk);

        standardInput.on('end', function(endEventData) {
            // Process any remaining partial input string at the end
            if (partialInputString) {
                // Append a newline to ensure the last fragment is processed as a line
                processInputChunk(partialInputString + "\n");
            }
            computeResults(); // Execute the main logic after all input is buffered
        });

        return function() {
            if (bufferIndex >= inputBuffer.length) {
                return null; // Indicate no more lines
            }
            return inputBuffer[bufferIndex++];
        };
    })();
} else {
    // V8 environment (e.g., d8 shell)
    // In V8, `print` and `readline` are global built-in functions.
    const outputValue = print;
    const fetchNextLine = readline;
    computeResults(); // Execute the main logic directly
}
