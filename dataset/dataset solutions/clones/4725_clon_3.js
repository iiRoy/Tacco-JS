const isNumberEven = (numValue) => numValue % 2 === 0;

function processInputData(rawInputContent) {
    const newlineDelimiter = "\n";
    const numberSeparator = " ";

    const allInputLines = rawInputContent.split(newlineDelimiter);
    const dataLine = allInputLines[1];

    const numericValues = dataLine.split(numberSeparator).map(Number);

    let evenNumbersCount = 0;
    let oddNumbersCount = 0;

    numericValues.forEach(currentNumber => {
        if (isNumberEven(currentNumber)) {
            evenNumbersCount++;
        } else {
            oddNumbersCount++;
        }
    });

    const finalDecision = (oddNumbersCount % 2 === 0) ? "YES" : "NO";

    console.log(finalDecision);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
