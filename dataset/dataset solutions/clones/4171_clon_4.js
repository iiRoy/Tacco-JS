const calculateCommonHalvings = (sourceText) => {
    let firstLineEndPosition = -1;
    let scanPosition = 0;

    // Manually locate the end of the first and second lines
    while (scanPosition < sourceText.length) {
        if (sourceText[scanPosition] === '\n') {
            if (firstLineEndPosition === -1) {
                firstLineEndPosition = scanPosition; // Marks end of the first line
            } else {
                // Marks end of the second line
                break;
            }
        }
        scanPosition++;
    }
    
    // Extract the content of the second line
    const numericContentLine = sourceText.substring(firstLineEndPosition + 1, scanPosition);

    // Extract all sequences of digits from the line using a regular expression
    const stringifiedNumericValues = numericContentLine.match(/\d+/g);

    // If no numbers are found, or the input format is unexpected
    if (!stringifiedNumericValues || stringifiedNumericValues.length === 0) {
        return 0;
    }

    // A dedicated routine to count how many times a single number can be divided by two
    const determineBinaryTrailingZeros = (valueRepresentation) => {
        let divisionCount = 0;
        let currentNumericValue = Number(valueRepresentation); // Convert string to number

        // Loop as long as the number is even and not zero (to prevent infinite loop for zero)
        while ((currentNumericValue & 1) === 0 && currentNumericValue > 0) {
            currentNumericValue >>= 1; // Bitwise right shift is equivalent to division by 2
            divisionCount++;
        }
        return divisionCount;
    };

    // Use a functional approach (reduce) to find the minimum division count across all numbers
    const minimalDivisionsAcrossAll = stringifiedNumericValues.reduce((smallestSeen, currentNumberString) => {
        const currentNumberDivisions = determineBinaryTrailingZeros(currentNumberString);
        return Math.min(smallestSeen, currentNumberDivisions);
    }, Infinity); // Start with a very large number to ensure the first comparison works

    return minimalDivisionsAcrossAll;
};

// Main execution block, using different variable and function names
const processExecution = () => {
    const entireInputData = require("node:fs").readFileSync("/dev/stdin", "utf8");
    const finalResult = calculateCommonHalvings(entireInputData);
    console.log(finalResult);
};

processExecution();