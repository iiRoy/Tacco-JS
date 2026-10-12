function processInputData(rawText) {
    const sumOfNumbers = rawText.split('\n').reduce((accumulator, currentLine) => {
        const parsedValue = Number(currentLine);
        return accumulator + parsedValue;
    }, 0);
    return 6 - sumOfNumbers;
}
console.log(processInputData(require("fs").readFileSync("/dev/stdin", "utf8")));
