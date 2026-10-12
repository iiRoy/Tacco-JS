function analyzeNumericData(sourceDataString) {
    const dataLines = sourceDataString.split("\n");
    const targetLine = dataLines[1];
    const stringNumbers = targetLine.split(" ");
    const parsedNumbers = stringNumbers.map(Number);

    const highestValue = Math.max(...parsedNumbers);
    const lowestValue = Math.min(...parsedNumbers);
    const valueDifference = highestValue - lowestValue;

    console.log(valueDifference);
}
analyzeNumericData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
