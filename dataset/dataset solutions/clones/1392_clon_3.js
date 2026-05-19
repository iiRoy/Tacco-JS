(function(rawDataInput) {
    const LINE_DELIMITER = '\n';
    const VALUE_DELIMITER = ' ';
    const STOP_SIGNAL_VALUE = '0';

    // Helper function to determine if the termination condition is met
    const checkTermination = (firstElement, secondElement) => {
        return firstElement === STOP_SIGNAL_VALUE && secondElement === STOP_SIGNAL_VALUE;
    };

    // Helper function to parse, sort, and format a single line of input
    const processAndFormatPair = (lineContent, separator) => {
        let stringParts = lineContent.split(separator);
        
        // Explicitly convert to numbers for sorting
        let numA = parseInt(stringParts[0], 10);
        let numB = parseInt(stringParts[1], 10);

        let numericPair = [numA, numB];

        // Define a numeric comparison function
        const numericSortComparator = (val1, val2) => val1 - val2;
        
        let sortedNumericPair = numericPair.sort(numericSortComparator);

        // Convert sorted numbers back to strings for joining
        let sortedStringPair = sortedNumericPair.map(String);

        return sortedStringPair.join(separator);
    };

    let inputLinesArray = rawDataInput.split(LINE_DELIMITER);
    let currentInputLine;

    // Use a while loop with shift for processing lines sequentially,
    // which is a common pattern for this type of input processing.
    while (inputLinesArray.length > 0) {
        currentInputLine = inputLinesArray.shift();

        // Temporarily split the line to check the termination condition
        let tempElements = currentInputLine.split(VALUE_DELIMITER);

        if (checkTermination(tempElements[0], tempElements[1])) {
            return; // Exit the IIFE if the stop signal is found
        }

        // If not a termination line, process and print the sorted pair
        let formattedOutput = processAndFormatPair(currentInputLine, VALUE_DELIMITER);
        console.log(formattedOutput);
    }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
