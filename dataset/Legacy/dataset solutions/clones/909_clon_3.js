//usr/bin/env node $0 $@;exit 
var executeProgram = function() {
    let inputLineData; 
    while (true) { 
        let currentInputString = readInputLine(); 
        if (currentInputString === null) { 
            break;
        }

        let parsedNumbers = currentInputString.split(' ').map(Number);
        
        if (!parsedNumbers[0]) { 
            break;
        }
        
        inputLineData = parsedNumbers; 

        const [firstValue, secondValue] = inputLineData; 
        outputResult(0); 
    }
};

// IO handling for Node.js environment
// The original `if(1)` block is always true, so we'll just use its content.
// The `else` block for V8 is dead code and has been removed.

var outputResult = function(valueToPrint) { 
    console.log(valueToPrint);
};

var readInputLine = (function() { 
    let bufferedLines = []; 
    let lineIndex = 0; 
    let inputStream = process.openStdin(); 
    inputStream.setEncoding('utf8');

    let partialInputBuffer = ""; 

    // Helper function to process incoming data chunks and populate bufferedLines
    const processIncomingData = (dataChunk) => {
        let combinedBuffer = partialInputBuffer + dataChunk;
        let lineSegments = combinedBuffer.split("\n"); 
        partialInputBuffer = lineSegments.pop(); 

        for (let idx = 0; idx < lineSegments.length; idx++) { 
            const currentSegment = lineSegments[idx];
            if (currentSegment.trim() !== '') { 
                bufferedLines.push(currentSegment);
            }
        }
    };

    inputStream.on('data', function(chunk) { 
        processIncomingData(chunk);
    });

    inputStream.on('end', function(endEvent) { 
        // Process any remaining partial input buffer after all data has been received
        if (partialInputBuffer.trim() !== '') { 
            bufferedLines.push(partialInputBuffer);
        }
        // The original code had `//main();` here. This is uncommented to enable program execution
        // once all input is buffered, which is the common intended behavior for this pattern.
        executeProgram(); 
    });

    return function() {
        if (lineIndex < bufferedLines.length) {
            return bufferedLines[lineIndex++];
        }
        return null; 
    };
})();
