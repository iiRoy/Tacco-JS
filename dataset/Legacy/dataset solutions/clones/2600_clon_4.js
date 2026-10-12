const fileProcessor = require("fs");

const calculateSequenceProperty = (sourceInput) => {
    const dataLines = sourceInput.split("\n");
    const elementCount = Number(dataLines[0]);
    const stringifiedNumbers = dataLines[1].split(" ");

    if (elementCount <= 1) {
        return 0;
    }

    // Create a numerical array, ensuring we handle potential missing elements as NaN
    // to match the original's parseInt(undefined) behavior.
    const numericValues = Array.from({ length: elementCount }, (_, index) => {
        return Number(stringifiedNumbers[index]);
    });

    // Generate pairs for comparison using functional mapping
    const comparisonPairs = numericValues.slice(0, elementCount - 1).map((currentElement, index) => {
        return [currentElement, numericValues[index + 1]];
    });

    // Aggregate consecutive non-increasing streak lengths using a reducer
    const streakAggregation = comparisonPairs.reduce((accumulator, currentCouple) => {
        // If either value is NaN (from missing input), comparison fails, resetting streak.
        if (currentCouple[0] >= currentCouple[1]) {
            accumulator.currentLength++;
        } else {
            accumulator.allLengths.push(accumulator.currentLength);
            accumulator.currentLength = 0;
        }
        return accumulator;
    }, { currentLength: 0, allLengths: [] });

    // Include the final streak length
    streakAggregation.allLengths.push(streakAggregation.currentLength);

    // Find the maximum length using the spread operator
    return Math.max(...streakAggregation.allLengths);
};

const standardInputLocator = "/dev/stdin";
const contentFormat = "utf8";

const rawFileContent = fileProcessor.readFileSync(standardInputLocator, contentFormat);
const finalOutcome = calculateSequenceProperty(rawFileContent);

console.log(finalOutcome);