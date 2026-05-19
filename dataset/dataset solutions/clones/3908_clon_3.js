function ProcessData(rawInputString) {
    const inputLineArray = rawInputString.split("\n");

    const parseNumericString = (strValue) => parseInt(strValue);

    const firstLineContent = inputLineArray[0];
    let dataSize = parseNumericString(firstLineContent);

    const numberStringComponents = inputLineArray[1].split(" ");
    let initialNumbers = numberStringComponents.map(function(numStr) {
        return parseNumericString(numStr);
    });

    let orderedNumbers = initialNumbers.slice().sort(function(firstVal, secondVal) {
        return firstVal - secondVal;
    });

    const midpointIndex = dataSize / 2;

    const lowerMedian = orderedNumbers[midpointIndex - 1];
    const upperMedian = orderedNumbers[midpointIndex];

    for (const currentNum of initialNumbers) {
        let resultForElement;
        if (currentNum <= lowerMedian) {
            resultForElement = upperMedian;
        } else {
            resultForElement = lowerMedian;
        }
        console.log(resultForElement);
    }
}

ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));
