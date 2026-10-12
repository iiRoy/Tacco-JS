//usr/bin/env node $0 $@;exit
var executeCoreLogic = function() {
    let currentInputLine;
    while ((currentInputLine = retrieveLine()) !== null) {
        const numericParts = currentInputLine.split(' ').map(Number);
        const primaryValue = numericParts[0];
        const secondaryValue = numericParts[1];

        if (primaryValue === 0) {
            break; // Terminate processing if the first number is zero
        }

        let smallestDeviation = Infinity;
        const iterationCeiling = Math.floor(primaryValue / 2);

        for (let iterationCounter = 0; iterationCounter <= iterationCeiling; ++iterationCounter) {
            const legOneLength = iterationCounter;
            const legTwoLength = primaryValue - iterationCounter;
            const calculatedHypotenuse = Math.sqrt(legOneLength * legOneLength + legTwoLength * legTwoLength);
            const currentDeviation = Math.abs(secondaryValue - calculatedHypotenuse);

            if (currentDeviation < smallestDeviation) {
                smallestDeviation = currentDeviation;
            }
        }
        outputResult(smallestDeviation);
    }
};

// Input/Output Abstraction Layer
if (typeof process !== 'undefined') {
    // Node.js environment specific implementation
    var outputResult = function(dataToLog) {
        console.log(dataToLog);
    };

    var retrieveLine = (function() {
        var bufferedLines = [];
        var currentLinePointer = 0;
        var incompleteInputBuffer = "";

        process.stdin.setEncoding('utf8');

        process.stdin.on('data', function(inputChunk) {
            var segments = (incompleteInputBuffer + inputChunk).split("\n");
            incompleteInputBuffer = segments.pop(); // Store any incomplete last line
            for (var i = 0; i < segments.length; i++) {
                if (segments[i] !== '') { // Only add non-empty lines
                    bufferedLines.push(segments[i]);
                }
            }
        });

        process.stdin.on('end', function() {
            if (incompleteInputBuffer) {
                // Process any remaining input in the buffer
                var segments = (incompleteInputBuffer + "\n").split("\n");
                incompleteInputBuffer = segments.pop(); // Should be empty after this
                for (var i = 0; i < segments.length; i++) {
                    if (segments[i] !== '') {
                        bufferedLines.push(segments[i]);
                    }
                }
            }
            executeCoreLogic(); // Start the main logic after all input has been received
        });

        return function() {
            if (currentLinePointer >= bufferedLines.length) {
                return null; // Indicate no more lines available
            }
            return bufferedLines[currentLinePointer++];
        };
    })();
} else {
    // V8 (or similar) environment specific implementation
    // Assumes 'print' and 'readline' are globally available
    var outputResult = print;
    var retrieveLine = readline;
    executeCoreLogic(); // Start the main logic immediately
}
