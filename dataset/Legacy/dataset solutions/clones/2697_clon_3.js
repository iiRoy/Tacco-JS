function processInputData(rawData) {
    const LINE_DELIMITER = "\n";
    const VALUE_DELIMITER = " ";

    const inputLines = rawData.split(LINE_DELIMITER);

    const dataLength = Number(inputLines[0]);

    const parseNumericArray = (lineContent) => {
        return lineContent.split(VALUE_DELIMITER).map(Number);
    };

    const initialNumericData = parseNumericArray(inputLines[1]);

    let sortedNumericData = [...initialNumericData];
    sortedNumericData.sort((a, b) => a - b);

    let differenceTally = 0;

    for (let currentIndex = 0; currentIndex < dataLength; currentIndex++) {
        if (sortedNumericData[currentIndex] !== initialNumericData[currentIndex]) {
            differenceTally++;
        }
    }

    let finalDecision;
    if (differenceTally <= 2) {
        finalDecision = "YES";
    } else {
        finalDecision = "NO";
    }

    console.log(finalDecision);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
