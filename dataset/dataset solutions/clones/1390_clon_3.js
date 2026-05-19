(function(rawDataInput){
    const LINE_SEPARATOR = '\n';
    const PART_SEPARATOR = ' ';
    const TERMINATION_VALUE = 0;

    const handleNumberPair = (numX, numY) => {
        if (numX <= numY) {
            console.log(`${numX}${PART_SEPARATOR}${numY}`);
        } else {
            console.log(`${numY}${PART_SEPARATOR}${numX}`);
        }
    };

    const allInputLines = rawDataInput.split(LINE_SEPARATOR);
    const totalLineCount = allInputLines.length;

    for (let currentLineIndex = 0; currentLineIndex < totalLineCount; currentLineIndex++) {
        const currentLineContent = allInputLines[currentLineIndex];
        const partsOfCurrentLine = currentLineContent.split(PART_SEPARATOR);

        const firstParsedNum = Number(partsOfCurrentLine[0]);
        const secondParsedNum = Number(partsOfCurrentLine[1]);

        const isTerminationConditionMet = (firstParsedNum === TERMINATION_VALUE && secondParsedNum === TERMINATION_VALUE);
        if (isTerminationConditionMet) {
            break;
        }

        handleNumberPair(firstParsedNum, secondParsedNum);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
