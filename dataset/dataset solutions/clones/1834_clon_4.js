(function(rawInputString) {
    // Custom input parsing (divergent from split/map)
    var lineSeparatorChar = '\n';
    var numberSeparatorChar = ' ';

    var allInputLines = [];
    var lineBeginIndex = 0;
    var nextNewlineIndex;
    while ((nextNewlineIndex = rawInputString.indexOf(lineSeparatorChar, lineBeginIndex)) !== -1) {
        allInputLines.push(rawInputString.substring(lineBeginIndex, nextNewlineIndex));
        lineBeginIndex = nextNewlineIndex + 1;
    }
    if (lineBeginIndex < rawInputString.length) { // Capture last line if no trailing newline
        allInputLines.push(rawInputString.substring(lineBeginIndex));
    }

    function parseLineNumbers(lineContent) {
        var numbersInLine = [];
        var numBeginIndex = 0;
        var nextSpaceIndex;
        while ((nextSpaceIndex = lineContent.indexOf(numberSeparatorChar, numBeginIndex)) !== -1) {
            numbersInLine.push(parseInt(lineContent.substring(numBeginIndex, nextSpaceIndex), 10));
            numBeginIndex = nextSpaceIndex + 1;
        }
        if (numBeginIndex < lineContent.length) { // Capture last number
            numbersInLine.push(parseInt(lineContent.substring(numBeginIndex), 10));
        }
        return numbersInLine;
    }

    var controlValueArr = parseLineNumbers(allInputLines[0]);
    var measurementSeriesArr = parseLineNumbers(allInputLines[1]);

    var arraySizeIndicator = controlValueArr[0]; // Corresponds to N in original

    // Forward pass: Generate initial candidate values recursively, storing in a Map
    var interimCalculationsMap = new Map();

    // Calculate the first element (index 0)
    var initialCandidateValue = 1 - measurementSeriesArr[0];
    interimCalculationsMap.set(0, initialCandidateValue);

    // Recursively compute subsequent elements from index 1 up to arraySizeIndicator-1
    (function generateSubsequentCandidates(currentIndex, previousCalculatedValue) {
        if (currentIndex >= arraySizeIndicator) { // Stop if current index reaches arraySizeIndicator
            return;
        }
        var currentCalculatedValue = previousCalculatedValue * 2 - measurementSeriesArr[currentIndex];
        interimCalculationsMap.set(currentIndex, currentCalculatedValue);
        generateSubsequentCandidates(currentIndex + 1, currentCalculatedValue);
    })(1, initialCandidateValue); // Start from index 1, using the initialCandidateValue

    // Explicitly set the value for the last index (arraySizeIndicator) to 0
    interimCalculationsMap.set(arraySizeIndicator, 0);

    // Backward pass: Adjust values, check constraints, and accumulate sum recursively
    var overallSummation = measurementSeriesArr[arraySizeIndicator]; // Initialize with A[N]
    var conditionViolationFlag = false;

    (function processBackwardRecursively(currentPosition, valueFromNextHigherPosition) {
        if (currentPosition < 0 || conditionViolationFlag) {
            return;
        }

        var candidateAtCurrentPosition = interimCalculationsMap.get(currentPosition);
        var upperBoundaryForCurrent = valueFromNextHigherPosition + measurementSeriesArr[currentPosition + 1];

        var finalizedValueForCurrent;
        if (candidateAtCurrentPosition > upperBoundaryForCurrent) {
            finalizedValueForCurrent = upperBoundaryForCurrent;
        } else if (candidateAtCurrentPosition * 2 < upperBoundaryForCurrent) {
            conditionViolationFlag = true;
            return;
        } else {
            finalizedValueForCurrent = candidateAtCurrentPosition;
        }

        overallSummation += finalizedValueForCurrent + measurementSeriesArr[currentPosition];
        processBackwardRecursively(currentPosition - 1, finalizedValueForCurrent);
    })(arraySizeIndicator - 1, 0); // Start from N-1, with x[N]=0 as valueFromNextHigherPosition

    if (conditionViolationFlag) {
        return '-1';
    } else {
        return String(overallSummation);
    }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));