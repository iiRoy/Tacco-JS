function processData(rawInputString) {
    const trimmedInput = rawInputString.trim();
    const stringParts = trimmedInput.split(' ');
    const parsedNumbers = stringParts.map(currentValueStr => parseInt(currentValueStr, 10));

    const firstValue = parsedNumbers[0];
    const secondValue = parsedNumbers[1];
    const thirdValue = parsedNumbers[2];

    const sumOfFirstTwo = firstValue + secondValue;

    let finalDecision;
    if (firstValue <= thirdValue && sumOfFirstTwo >= thirdValue) {
        finalDecision = "YES";
    } else {
        finalDecision = "NO";
    }
    console.log(finalDecision);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
