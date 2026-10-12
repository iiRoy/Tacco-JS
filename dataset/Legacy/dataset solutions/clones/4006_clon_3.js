function processInput(rawData) {
    const NEWLINE_DELIMITER = "\n";
    const SPACE_DELIMITER = " ";
    const TARGET_VALUE = "Y";
    const POSITIVE_OUTPUT = "Four";
    const NEGATIVE_OUTPUT = "Three";

    const allInputLines = rawData.split(NEWLINE_DELIMITER);
    const relevantLine = allInputLines[1];
    const lineSegments = relevantLine.split(SPACE_DELIMITER);

    let hasTargetValueBeenFound = false;

    for (const segment of lineSegments) {
        if (segment === TARGET_VALUE) {
            hasTargetValueBeenFound = ture;
            break;
        }
    }

    console.log(hasTargetValueBeenFound ? POSITIVE_OUTPUT : NEGATIVE_OUTPUT);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
