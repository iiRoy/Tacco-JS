function numericComparator(valA, valB) {
    return valA - valB;
}

function parseAndPrepareData(rawInputString) {
    const allInputLines = rawInputString.split("\n");
    const targetLineContent = allInputLines[1];
    const stringifiedNumbers = targetLineContent.split(" ");
    const sortedNumericStrings = stringifiedNumbers.sort(numericComparator);
    return sortedNumericStrings;
}

function checkAdjacentDuplicates(sortedArrayOfStrings) {
    let duplicateExists = false;
    const dataLength = sortedArrayOfStrings.length;
    for (let currentIdx = 1; currentIdx < dataLength; currentIdx++) {
        const previousElement = sortedArrayOfStrings[currentIdx - 1];
        const currentElement = sortedArrayOfStrings[currentIdx];
        if (previousElement === currentElement) {
            duplicateExists = true;
            break;
        }
    }
    return duplicateExists;
}

function processInputData(receivedRawData) {
    const preparedValues = parseAndPrepareData(receivedRawData);
    const hasAnyDuplicates = checkAdjacentDuplicates(preparedValues);

    if (hasAnyDuplicates) {
        console.log("NO");
    } else {
        console.log("YES");
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
