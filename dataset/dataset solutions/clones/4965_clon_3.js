const parseLineAsInteger = (lineContent) => {
    return parseInt(lineContent, 10);
};

function processTrapezoidData(rawInputContent) {
    const inputLines = rawInputContent.split("\n");

    const baseOne = parseLineAsInteger(inputLines[0]);
    const baseTwo = parseLineAsInteger(inputLines[1]);
    const heightValue = parseLineAsInteger(inputLines[2]);

    const sumOfBases = baseOne + baseTwo;
    const intermediateProduct = sumOfBases * heightValue;
    const calculatedAreaValue = intermediateProduct / 2;

    console.log('%d', calculatedAreaValue);
}

processTrapezoidData(require("fs").readFileSync("/dev/stdin", "utf8"));
