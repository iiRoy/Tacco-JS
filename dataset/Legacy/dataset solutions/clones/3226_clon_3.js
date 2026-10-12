function processInputData(rawInputString) {
    var inputLines = rawInputString.split('\n');

    var firstLineContent = inputLines[0];
    var firstLineParts = firstLineContent.split(" ");
    var pieceCountString = firstLineParts[0];
    var requiredPieceCount = Number(pieceCountString);

    var secondLineContent = inputLines[1];
    var secondLineTrimmed = secondLineContent.trim();
    var coordinateStrings = secondLineTrimmed.split(" ");
    var numericCoordinates = coordinateStrings.map(Number);

    var sortAscending = (valA, valB) => valA - valB;
    var sortedPositions = numericCoordinates.sort(sortAscending);

    var positionDifferences = [];
    var totalPositions = sortedPositions.length;

    for (let k = 1; k < totalPositions; k++) {
        let currentPosition = sortedPositions[k];
        let previousPosition = sortedPositions[k - 1];
        let difference = currentPosition - previousPosition;
        positionDifferences.push(difference);
    }

    var sortedDifferences = positionDifferences.sort(sortAscending);

    var numDifferencesToSum = sortedDifferences.length - requiredPieceCount + 1;
    var finalDifferencesSubset = sortedDifferences.slice(0, numDifferencesToSum);

    let totalSumOfDifferences = 0;
    for (const diffValue of finalDifferencesSubset) {
        totalSumOfDifferences += diffValue;
    }

    console.log(totalSumOfDifferences);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
