function processInputData(rawData) {
    const linesArray = rawData.split("\n");

    const TERMINATION_CHAR = "0";
    const NUMBER_DELIMITER = " ";

    const parseLineToNumbers = (lineContent) => {
        return lineContent.split(NUMBER_DELIMITER).map(Number);
    };

    const formatOutputPair = (valA, valB) => {
        return `${valA} ${valB}`;
    };

    let lineIndex = 0;
    while (true) {
        // This check replicates the original's behavior: if linesArray[lineIndex] is undefined,
        // accessing [0] will throw a TypeError, which is preserved.
        const currentLineFirstCharacter = linesArray[lineIndex][0];

        if (currentLineFirstCharacter === TERMINATION_CHAR) {
            break;
        }

        const currentLineContent = linesArray[lineIndex];
        const [firstNumber, secondNumber] = parseLineToNumbers(currentLineContent);

        if (firstNumber > secondNumber) {
            console.log(formatOutputPair(secondNumber, firstNumber));
        } else {
            console.log(formatOutputPair(firstNumber, secondNumber));
        }
        lineIndex++;
    }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
