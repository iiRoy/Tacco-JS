(function(rawInputString){
    const LINE_DELIMITER_CHAR = "\n";
    const VALUE_DELIMITER_CHAR = " ";

    const inputLinesArray = rawInputString.split(LINE_DELIMITER_CHAR);

    const parsedDataRows = inputLinesArray.map(function(singleLineString) {
        return singleLineString.split(VALUE_DELIMITER_CHAR);
    });

    let currentProcessingIndex = 0;

    while (true) {
        const activeDataRow = parsedDataRows[currentProcessingIndex];
        const firstElementAsString = activeDataRow[0];
        const secondElementAsString = activeDataRow[1];

        // Check for termination condition using string comparison
        if (firstElementAsString === '0' && secondElementAsString === '0') {
            break;
        }

        // Convert string elements to numbers for output
        const numericValueOne = +secondElementAsString;
        const numericValueTwo = +firstElementAsString;

        console.log(numericValueOne + VALUE_DELIMITER_CHAR + numericValueTwo);

        currentProcessingIndex++;
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
