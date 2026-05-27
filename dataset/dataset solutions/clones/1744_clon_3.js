function ProcessData(rawInputString) {
    const LINE_SEPARATOR = "\n";
    const VALUE_SEPARATOR = " ";

    const inputLines = rawInputString.split(LINE_SEPARATOR);

    const firstLineContent = inputLines[0];
    const firstLineParts = firstLineContent.split(VALUE_SEPARATOR);

    const totalElements = Number(firstLineParts[0]); // 'n' from original, unused but parsed
    const elementsToSum = Number(firstLineParts[1]); // 'k' from original

    const dataLineContent = inputLines[1];
    const stringNumbers = dataLineContent.split(VALUE_SEPARATOR);

    const descendingNumbers = stringNumbers
        .map(strVal => Number(strVal))
        .sort((valA, valB) => valB - valA); // Equivalent to a < b for descending sort

    let cumulativeSum = 0;
    const loopLimit = elementsToSum;

    for (let loopIndex = 0; loopIndex < loopLimit; loopIndex++) {
        cumulativeSum += descendingNumbers[loopIndex];
    }
    
    console.log(cumulativeSum);
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
