//usr/bin/env node $0 $@;exit 
var main = function() {
    let currentInputLine;
    while ((currentInputLine = readline()) !== null) {
        const numericParts = currentInputLine.split(' ').map(Number);
        const firstOperand = numericParts[0];
        const secondOperand = numericParts[1];

        if (firstOperand === 0) {
            break;
        }

        const iterationLimit = Math.floor(firstOperand / 2);
        
        // Generate a sequence of numbers from 0 to iterationLimit
        // and use reduce to find the minimum difference
        const minimumCalculatedDifference = Array.from({ length: iterationLimit + 1 }, (_, indexValue) => indexValue)
            .reduce((accumulator, currentIterationValue) => {
                const hypotenuseResult = Math.hypot(currentIterationValue, firstOperand - currentIterationValue);
                const absoluteDifference = Math.abs(secondOperand - hypotenuseResult);
                return Math.min(accumulator, absoluteDifference);
            }, 1 << 30); // Initialize with a large value, matching original r

        print(minimumCalculatedDifference);
    }
};

/// IO ///
if (typeof process !== 'undefined') {
    //node.js
    var print = function(outputValue) {
        console.log(outputValue);
    };
    var readline = (function() {
        var inputBuffer = [];
        var readIndex = 0;
        var inputSource = process.openStdin();
        inputSource.setEncoding('utf8');

        var pendingInput = "";
        inputSource.on('data', function(incomingData) {
            var lineSegments = (pendingInput + incomingData).split("\n");
            pendingInput = lineSegments.pop();
            for (var segmentIterator = 0; segmentIterator < lineSegments.length; segmentIterator++) {
                if (lineSegments[segmentIterator] === '') continue;
                inputBuffer.push(lineSegments[segmentIterator]);
            }
        });
        inputSource.on('end', function(endEventArg) {
            if (pendingInput) {
                var lineSegments = (pendingInput + "\n").split("\n");
                pendingInput = lineSegments.pop();
                for (var segmentIterator = 0; segmentIterator < lineSegments.length; segmentIterator++) {
                    if (lineSegments[segmentIterator] === '') continue;
                    inputBuffer.push(lineSegments[segmentIterator]);
                }
            }
            main();
        });

        return function() {
            if (inputBuffer.length <= readIndex) return null;
            return inputBuffer[readIndex++];
        };
    })();
} else {
    //v8
    main();
}
