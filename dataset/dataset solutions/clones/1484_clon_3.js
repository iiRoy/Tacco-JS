function processInputData(rawInputString) {
    const trimmedInput = rawInputString.trim();
    const inputLines = trimmedInput.split("\n");

    const firstLineContent = inputLines[0];
    const firstLineTokens = firstLineContent.split(" ");

    const parsedNumbers = firstLineTokens.slice(0, 2).map(token => parseInt(token, 10));

    const firstValue = parsedNumbers[0];
    const secondValue = parsedNumbers[1];
    const decrementedFirst = firstValue - 1;
    const finalCalculationResult = decrementedFirst - secondValue;

    console.log(finalCalculationResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
