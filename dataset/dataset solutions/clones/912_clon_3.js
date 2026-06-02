//usr/bin/env node $0 $@;exit 
var executeProgram = function() {
    var inputLineParts;
    var firstNum;
    var secondNum;

    // Helper function to encapsulate the core calculation logic
    // This replaces the Math.min.apply(null, Array.apply(...).map(...)) structure
    var calculateMinHypotenuseDifference = function(valA, valB) {
        let currentMinimumDiff = Infinity;
        // The original loop limit was 1 + (a / 2 ^ 0), which is equivalent to 1 + Math.floor(a / 2)
        const iterationLimit = 1 + Math.floor(valA / 2); 

        for (let currentIterationIndex = 0; currentIterationIndex < iterationLimit; currentIterationIndex++) {
            const hypotenuseValue = Math.hypot(currentIterationIndex, valA - currentIterationIndex);
            const absoluteDifference = Math.abs(valB - hypotenuseValue);
            
            if (absoluteDifference < currentMinimumDiff) {
                currentMinimumDiff = absoluteDifference;
            }
        }
        return currentMinimumDiff;
    };

    while (true) {
        const rawLine = readInputLine();
        if (rawLine === null) { // Check for end of input stream
            break;
        }

        // Split and parse the input line
        inputLineParts = rawLine.split(' ').map(Number);
        firstNum = inputLineParts[0];

        // The original loop condition was based on the first number being non-zero
        if (firstNum === 0) { 
            break;
        }
        
        secondNum = inputLineParts[1];
        
        // Perform the calculation using the extracted helper function
        const computedResult = calculateMinHypotenuseDifference(firstNum, secondNum);
        outputResult(computedResult);
    }
};

/// IO Handling ///
if (1) {
    // Node.js specific I/O implementation
    var outputResult = function(valueToPrint) {
        console.log(valueToPrint);
    };

    var readInputLine = (function() {
        var inputBuffer = [];
        var bufferIndex = 0;
        var standardInput = process.openStdin();
        standardInput.setEncoding('utf8');

        var partialInputBuffer = "";
        standardInput.on('data', function(incomingData) {
            var processedLines = (partialInputBuffer + incomingData).split("\n");
            partialInputBuffer = processedLines.pop(); // Store any incomplete last line
            for (var i = 0; i < processedLines.length; i++) {
                if (processedLines[i] === '') continue; // Skip empty lines that might result from split
                inputBuffer.push(processedLines[i]);
            }
        });
        standardInput.on('end', function(_endEvent) { // _endEvent parameter is not used
            if (partialInputBuffer) { // Process any remaining data after stream ends
                var processedLines = (partialInputBuffer + "\n").split("\n"); 
                partialInputBuffer = processedLines.pop(); 
                for (var i = 0; i < processedLines.length; i++) {
                    if (processedLines[i] === '') continue;
                    inputBuffer.push(processedLines[i]);
                }
            }
            executeProgram(); // Start the main program logic once all input is buffered
        });

        return function() {
            if (inputBuffer.length <= bufferIndex) {
                return null; // Signal that no more lines are available
            }
            return inputBuffer[bufferIndex++];
        };
    })();
} else {
    // V8 shell environment (alternative, not used in this Node.js setup)
    executeProgram();
}
