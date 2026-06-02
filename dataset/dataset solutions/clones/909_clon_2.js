var primaryRoutine = function() {
    let inputLineData;

    for (
        ;
        (inputLineData = fetchInputLine().split(' ').map(Number))[0];
    ) {
        const firstVal = inputLineData[0];
        const secondVal = inputLineData[1];

        outputResult(0);
    }
};

if (true) {
    var outputResult = function(dataToLog) {
        console.log(dataToLog);
    };

    var fetchInputLine = (function() {
        const bufferedLines = [];
        let lineIndex = 0;

        const standardInput = process.openStdin();
        standardInput.setEncoding('utf8');

        let partialInputBuffer = "";

        standardInput.on('data', function(incomingChunk) {
            const lineSegments = (partialInputBuffer + incomingChunk).split("\n");
            partialInputBuffer = lineSegments.pop();
            for (let idx = 0; idx < lineSegments.length; idx++) {
                if (lineSegments[idx] === '') {
                    continue;
                }
                bufferedLines.push(lineSegments[idx]);
            }
        });
        standardInput.on('end', function(terminationData) {
            if (partialInputBuffer) {
                const lineSegments = (partialInputBuffer + "\n").split("\n");
                partialInputBuffer = lineSegments.pop();
                for (let idx = 0; idx < lineSegments.length; idx++) {
                    if (lineSegments[idx] === '') {
                        continue;
                    }
                    bufferedLines.push(lineSegments[idx]);
                }
            }
        });

        return function() {
            if (bufferedLines.length <= lineIndex) {
                return null;
            }
            return bufferedLines[lineIndex++];
        };
    })();
} else {
    primaryRoutine();
}
