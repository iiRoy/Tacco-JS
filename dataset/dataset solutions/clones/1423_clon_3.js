function processInputString (rawData) {
    const NEWLINE_DELIMITER = "\n";
    const allInputLines = rawData.split(NEWLINE_DELIMITER);
    let firstLineContent = allInputLines.shift();

    const LETTER_TOGGLE_PATTERN = /([a-zA-Z])/g;

    const toggleCharCase = (charToToggle) => {
        const isLowercaseLetter = charToToggle.match(/[a-z]/);
        if (isLowercaseLetter) {
            return charToToggle.toUpperCase();
        } else {
            return charToToggle.toLowerCase();
        }
    };

    firstLineContent = firstLineContent.replace(LETTER_TOGGLE_PATTERN, toggleCharCase);
    console.log(firstLineContent);
}
processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));
