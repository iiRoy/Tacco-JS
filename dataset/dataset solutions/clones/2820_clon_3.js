function processInputData(rawContent) {
    const trimmedContent = rawContent.trim();
    const stringParts = trimmedContent.split(' ');

    const parseNumberString = (numStr) => {
        return parseInt(numStr, 10);
    };

    const numericValues = stringParts.map(parseNumberString);

    const firstValue = numericValues[0];
    const secondValue = numericValues[1];

    let comparisonResult;
    if (firstValue >= secondValue) {
        comparisonResult = 10;
    } else {
        comparisonResult = 0;
    }

    console.log(comparisonResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
