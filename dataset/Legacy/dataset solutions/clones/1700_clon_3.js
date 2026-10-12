function processInputData(rawData) {
    const inputLines = rawData.split("\n");
    const elementCountStr = inputLines[0];
    const numbersLineStr = inputLines[1];

    const countElements = parseInt(elementCountStr, 10);
    const numberStrings = numbersLineStr.split(" ");

    const originalNumbers = numberStrings.slice(0, countElements).map(str => parseInt(str, 10));

    const doubledNumbers = originalNumbers.flatMap(num => [num, num]);

    const descendingComparator = (valA, valB) => {
        return (valA < valB ? 1 : -1);
    };
    doubledNumbers.sort(descendingComparator);

    const calculateSpecificSum = (dataArray, initialValue, startIndex, endIndex) => {
        let currentSum = initialValue;
        for (let k = startIndex; k < endIndex; k++) {
            currentSum += dataArray[k];
        }
        return currentSum;
    };

    const initialSumComponent = doubledNumbers[0];
    const loopStartIndex = 2;
    const loopEndIndex = countElements;

    const finalSum = calculateSpecificSum(doubledNumbers, initialSumComponent, loopStartIndex, loopEndIndex);
    console.log(finalSum);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
