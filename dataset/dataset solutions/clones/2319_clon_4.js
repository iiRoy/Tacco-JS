function processInputData(rawData) {
    const processedLines = rawData.trim().split("\n");
    const firstVal = Number(processedLines[0]);
    const secondVal = Number(processedLines[1]);
    const availableNumbers = new Set([1, 2, 3]);
    availableNumbers.delete(firstVal);
    availableNumbers.delete(secondVal);
    const resultantNumber = Array.from(availableNumbers)[0];
    console.log(resultantNumber);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
