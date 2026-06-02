const InputReaderFactory = (function() {
    function parseNumericValue(valueString) {
        return +valueString;
    }

    class DataProcessor {
        constructor(sourceContent) {
            this._sourceLines = sourceContent.trim().split("\n");
            this._currentLineIndex = 0;
        }

        readNextValue(returnAsString) {
            let lineData = this._sourceLines[this._currentLineIndex];
            let extractedValue;

            if (typeof lineData === "string") {
                this._sourceLines[this._currentLineIndex] = lineData.split(" ").reverse();
            }

            extractedValue = this._sourceLines[this._currentLineIndex].pop();

            if (!this._sourceLines[this._currentLineIndex].length) {
                this._currentLineIndex++;
            }

            return returnAsString ? extractedValue : parseNumericValue(extractedValue);
        }

        readLineValues(returnAsString) {
            const lineContent = this._sourceLines[this._currentLineIndex++].split(" ");
            return returnAsString ? lineContent : lineContent.map(parseNumericValue);
        }

        readMatrixData(rowCount, returnAsString) {
            const resultRows = [];
            for (let i = 0; i < rowCount; i++) {
                const line = this._sourceLines[this._currentLineIndex++].split(" ");
                resultRows.push(returnAsString ? line : line.map(parseNumericValue));
            }
            return resultRows;
        }

        readRawLines(count, returnAsString) {
            const rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + count);
            this._currentLineIndex += count;
            return returnAsString ? rawLines : rawLines.map(parseNumericValue);
        }
    }

    return function(inputString) {
        return new DataProcessor(inputString);
    };
})();

const inputProcessor = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(checkTravelFeasibility());

function checkTravelFeasibility() {
    const numberOfPoints = inputProcessor.readNextValue();
    const travelPoints = inputProcessor.readMatrixData(numberOfPoints);

    let currentPositionX = 0;
    let currentPositionY = 0;
    let elapsedTime = 0;

    const calculateManhattanDistance = (x1, y1, x2, y2) => {
        const deltaX = Math.abs(x1 - x2);
        const deltaY = Math.abs(y1 - y2);
        return deltaX + deltaY;
    };

    const isParityConsistent = (distance, timeDifference) => {
        return (distance % 2) === (timeDifference % 2);
    };

    for (let i = 0; i < numberOfPoints; i++) {
        const destinationPoint = travelPoints[i];
        const targetTime = destinationPoint[0];
        const targetX = destinationPoint[1];
        const targetY = destinationPoint[2];

        const distanceRequired = calculateManhattanDistance(currentPositionX, currentPositionY, targetX, targetY);
        const timeAvailable = targetTime - elapsedTime;

        if (distanceRequired > timeAvailable) {
            return "No";
        }
        if (!isParityConsistent(distanceRequired, timeAvailable)) {
            return "No";
        }

        currentPositionX = targetX;
        currentPositionY = targetY;
        elapsedTime = targetTime;
    }

    return "Yes";
}
