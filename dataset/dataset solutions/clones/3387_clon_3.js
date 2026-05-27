function processInputData(rawInputString) {
    const LINE_DELIMITER = "\n";
    const FIRST_PLAYER_MESSAGE = "first";
    const SECOND_PLAYER_MESSAGE = "second";

    let inputLines = rawInputString.split(LINE_DELIMITER);
    
    inputLines.shift(); 
    
    let numericValues = inputLines.map(Number);

    let calculatedSum = computeArrayTotal(numericValues);

    const isSumOdd = (calculatedSum % 2 !== 0);

    if (isSumOdd) {
        console.log(FIRST_PLAYER_MESSAGE);
    } else {
        console.log(SECOND_PLAYER_MESSAGE);
    }
}

const STDIN_FILE_PATH = "/dev/stdin";
const FILE_ENCODING_TYPE = "utf8";

function readAndTrimStandardInput() {
    return require("fs").readFileSync(STDIN_FILE_PATH, FILE_ENCODING_TYPE).trim();
}

processInputData(readAndTrimStandardInput());

function computeArrayTotal(sourceArray) {
    return sourceArray.reduce((currentTotal, currentValue) => {
        return currentTotal + currentValue;
    }, 0);
}
