function processInputData(rawData) {
    rawData = rawData.trim();

    const alphabetChars = Array.from({ length: 26 }, (_, charIndex) => String.fromCharCode('A'.charCodeAt(0) + charIndex)).join('');

    let resultString = "";

    const allInputLines = rawData.split("\n");

    const dimensionLineParts = allInputLines[0].split(" ");
    const numRows = parseInt(dimensionLineParts[0]);
    const numCols = parseInt(dimensionLineParts[1]);

    const targetSearchWord = "snuke";

    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const currentDataRow = allInputLines[rowIndex + 1].split(" ");

        for (let colIndex = 0; colIndex < currentDataRow.length; colIndex++) {
            if (currentDataRow[colIndex] === targetSearchWord) {
                resultString += alphabetChars[colIndex] + (rowIndex + 1);
            }
        }
    }

    console.log(resultString);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
