function processInputData (rawData) {
    const TERMINATION_CHAR = '0';
    let inputLines = rawData.split("\n");

    const computeSumOfDigits = (charArray) => {
        const numericValues = charArray.map(char => parseInt(char, 10));
        const finalSum = numericValues.reduce((sumAccumulator, currentDigit) => sumAccumulator + currentDigit, 0);
        return finalSum;
    };

    while (true) {
        let currentLineString = inputLines.shift();
        let lineCharacters = currentLineString.split("");

        if (lineCharacters[0] === TERMINATION_CHAR) {
            break;
        }

        console.log(computeSumOfDigits(lineCharacters));
    }
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
