function processInputData(rawInputString) {
    const NEWLINE_DELIMITER = "\n";
    const SPACE_DELIMITER = " ";

    const determineOutputValue = (num) => {
        if (num % 2 === 0) {
            return num / 2;
        } else {
            return Math.ceil(num / 2);
        }
    };

    const inputLines = rawInputString.split(NEWLINE_DELIMITER);
    const firstLineTokens = inputLines[0].split(SPACE_DELIMITER);

    const parsedNumber = parseInt(firstLineTokens[0], 10);

    const finalOutput = determineOutputValue(parsedNumber);

    console.log(finalOutput.toString());
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
