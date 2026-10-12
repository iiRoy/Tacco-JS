function processInput(rawData) {
    const inputLines = rawData.split("\n");
    const firstLineContent = inputLines[0];
    const characterDigits = firstLineContent.split("");

    let accumulatedSum = 0;
    const digitCount = characterDigits.length;
    const targetDivisor = 9;

    for (let index = 0; index < digitCount; index++) {
        const currentNumericValue = parseInt(characterDigits[index], 10);
        accumulatedSum += currentNumericValue;
    }

    const finalDecision = (accumulatedSum % targetDivisor === 0) ? "Yes" : "No";

    console.log(finalDecision);
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
