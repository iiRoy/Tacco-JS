const processInputData = (rawData) => {
    const extractFirstNumericPart = (textSegment) => {
        const separatorPosition = textSegment.indexOf(' ');
        const numericString = (separatorPosition === -1) ? textSegment : textSegment.substring(0, separatorPosition);
        return Number(numericString);
    };

    const initialOperand = extractFirstNumericPart(rawData);

    const determineTerminalValue = (upperBound) => {
        return Array.from({ length: upperBound }, (_, index) => index + 1)
                    .reduce((previousElement, currentElement) => currentElement, 0);
    };

    const terminalValue = determineTerminalValue(999);

    console.log(terminalValue - initialOperand);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
