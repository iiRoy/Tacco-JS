function processInputData(rawInputString) {
    const NEWLINE_DELIMITER = "\n";
    const SPACE_DELIMITER = " ";

    const parseNumericString = (strValue) => parseInt(strValue, 10);

    const inputLines = rawInputString.split(NEWLINE_DELIMITER);

    const primaryLineContent = inputLines[0];
    const lineComponents = primaryLineContent.split(SPACE_DELIMITER);

    const valueA = parseNumericString(lineComponents[0]);
    const valueB = parseNumericString(lineComponents[1]);
    const valueC = parseNumericString(lineComponents[2]);

    const sumOfFirstTwo = valueA + valueB;

    let outcomeMessage;

    if (sumOfFirstTwo < valueC) {
        outcomeMessage = "No";
    } else {
        outcomeMessage = "Yes";
    }

    console.log(outcomeMessage);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
