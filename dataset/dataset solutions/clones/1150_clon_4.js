try {
    let outputEmitter = console.log;

    if (typeof process !== "undefined" && typeof process.stdin !== "undefined") {
        let fullInputBuffer = "";
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', function (segment) {
            fullInputBuffer += segment;
        });
        process.stdin.on('end', function () {
            let processedLines = fullInputBuffer.split("\n");
            computeMaximalRectangleArea(processedLines);
        });
    }

    function computeMaximalRectangleArea(rawInputStrings) {
        let numericalGridData = rawInputStrings.map(function (entry) {
            return entry.split(" ").map(function (numericString) {
                return Number(numericString);
            });
        });

        let gridDimensions = numericalGridData.shift();
        let numRows = gridDimensions[0];
        let numColumns = gridDimensions[1];

        let largestAreaFound = 0;
        let columnHeights = new Array(numColumns).fill(0);

        for (let rowIterator = 0; rowIterator < numRows; rowIterator++) {
            for (let colIterator = 0; colIterator < numColumns; colIterator++) {
                if (numericalGridData[rowIterator][colIterator] === 1) {
                    columnHeights[colIterator]++;
                } else {
                    columnHeights[colIterator] = 0;
                }
            }

            let indexStack = [];
            let augmentedHeights = columnHeights.concat([0]); // Append a zero to flush the stack

            for (let currentColumnIndex = 0; currentColumnIndex < augmentedHeights.length; currentColumnIndex++) {
                while (indexStack.length > 0 && augmentedHeights[indexStack[indexStack.length - 1]] >= augmentedHeights[currentColumnIndex]) {
                    let poppedHeight = augmentedHeights[indexStack.pop()];
                    let rectangleWidth = indexStack.length === 0 ? currentColumnIndex : currentColumnIndex - indexStack[indexStack.length - 1] - 1;
                    let currentComputedArea = poppedHeight * rectangleWidth;

                    if (currentComputedArea > largestAreaFound) {
                        largestAreaFound = currentComputedArea;
                    }
                }
                indexStack.push(currentColumnIndex);
            }
        }
        outputEmitter(largestAreaFound);
    }

} catch (err) {
    outputEmitter(err);
}