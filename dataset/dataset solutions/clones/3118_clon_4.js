const inputProcessor = (function(textualSource) {
    class DataSegmentHandler {
        constructor(contentString) {
            this.segmentsList = contentString.trim().split('\n');
            this.currentPosition = 0;
        }

        // Corresponds to original 'a' method
        extractNextElement(returnAsString) {
            let activeSegment = this.segmentsList[this.currentPosition];
            if (typeof activeSegment === "string") {
                this.segmentsList[this.currentPosition] = activeSegment.split(" ").reverse();
            }
            let fetchedItem = this.segmentsList[this.currentPosition].pop();
            if (!this.segmentsList[this.currentPosition].length) {
                this.currentPosition++;
            }
            return returnAsString ? fetchedItem : +fetchedItem;
        }

        // Corresponds to original 'l' method
        retrieveCurrentLine(returnAsString) {
            let components = this.segmentsList[this.currentPosition++].split(" ");
            return returnAsString ? components : components.map(unit => +unit);
        }

        // Corresponds to original 'm' method
        getGroupedLines(numberOfRows, returnAsString) {
            let collection = this.segmentsList.slice(this.currentPosition, this.currentPosition + numberOfRows)
                .map(lineContent => lineContent.split(" "));
            this.currentPosition += numberOfRows;
            return returnAsString ? collection : collection.map(rowUnits => rowUnits.map(itemUnit => +itemUnit));
        }

        // Corresponds to original 'r' method
        fetchSequentialLines(lineQuantity, returnAsString) {
            let blockData = this.segmentsList.slice(this.currentPosition, this.currentPosition + lineQuantity);
            this.currentPosition += lineQuantity;
            return returnAsString ? blockData : blockData.map(item => +item);
        }
    }
    return new DataSegmentHandler(textualSource);
})(require("fs").readFileSync("/dev/stdin","utf8"));

const locateInsertionPoint = (dataCollection, lowerBoundary, upperBoundary, targetSearchValue) => {
    let currentLower = lowerBoundary;
    let currentUpper = upperBoundary;
    while (currentLower < currentUpper) {
        let midPoint = Math.floor((currentLower + currentUpper) / 2);
        if (dataCollection[midPoint] <= targetSearchValue) {
            currentLower = midPoint + 1;
        } else {
            currentUpper = midPoint;
        }
    }
    return currentLower;
};

const processGraphData = () => {
    const totalNodes = inputProcessor.extractNextElement();
    const totalEdges = inputProcessor.extractNextElement();

    const nodeDegrees = Array.from({length: totalNodes + 1}, () => 0);

    const edgeConnections = Array.from({length: totalEdges}, () => inputProcessor.retrieveCurrentLine());

    edgeConnections.forEach(connectionPair => {
        nodeDegrees[connectionPair[0]]++;
        nodeDegrees[connectionPair[1]]++;
    });

    let cumulativeScore = 0;
    let isGraphValid = true;

    nodeDegrees.slice(1).forEach(degreeValue => {
        if (degreeValue % 2 !== 0) {
            isGraphValid = false;
        }
        cumulativeScore += degreeValue - 2;
    });

    if (!isGraphValid) {
        return "No";
    }

    return cumulativeScore >= 4 ? "Yes" : "No";
};

console.log(processGraphData());