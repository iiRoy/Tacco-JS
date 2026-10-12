function processInputData(rawInputString) {
    const HASH_CHARACTER = '#';
    const NEWLINE_SEPARATOR = '\n';
    const WHITESPACE_SEPARATOR = ' ';

    const allInputLines = rawInputString.split(NEWLINE_SEPARATOR);

    const dimensionStrings = allInputLines[0].split(WHITESPACE_SEPARATOR);
    const gridHeightValue = Number(dimensionStrings[0]);
    const gridWidthValue = Number(dimensionStrings[1]);

    const generateRepeatedCharString = (length, char) => {
        let constructedString = '';
        for (let charIndex = 0; charIndex < length; charIndex++) {
            constructedString += char;
        }
        return constructedString;
    };

    const borderRowLength = gridWidthValue + 2;
    const topBottomBorder = generateRepeatedCharString(borderRowLength, HASH_CHARACTER);

    console.log(topBottomBorder);

    const contentLineCount = gridHeightValue;
    for (let currentLineIndex = 0; currentLineIndex < contentLineCount; currentLineIndex++) {
        const dataRow = allInputLines[currentLineIndex + 1];
        const formattedDataRow = HASH_CHARACTER + dataRow + HASH_CHARACTER;
        console.log(formattedDataRow);
    }

    console.log(topBottomBorder);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
