function printResult(content) {
    console.log(content);
}

function processInput(rawData) {
    const inputLines = rawData.split("\n");

    const [requiredDashIndex, stringExpectedLength] = inputLines[0].split(" ").map(Number);

    const inputSequence = inputLines[1];

    const isFormatValid = inputSequence.split('').every((characterAtPosition, currentPosition) => {
        return (currentPosition === requiredDashIndex) === (characterAtPosition === '-');
    });

    printResult(isFormatValid ? "Yes" : "No");
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
