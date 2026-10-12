function processInput(sourceData) {
    const LINE_DELIMITER = "\n";
    const TARGET_PREFIX = "YAKI";
    const POSITIVE_RESPONSE = "Yes";
    const NEGATIVE_RESPONSE = "No";

    const inputLines = sourceData.split(LINE_DELIMITER);

    const primaryLine = inputLines[0];

    const doesLineStartWithPrefix = primaryLine.indexOf(TARGET_PREFIX) === 0;

    if (doesLineStartWithPrefix) {
        console.log(POSITIVE_RESPONSE);
    } else {
        console.log(NEGATIVE_RESPONSE);
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
