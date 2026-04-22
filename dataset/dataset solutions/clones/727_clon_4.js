const filesystem = require('fs');

const transformCalculation = (numericalInputs) => {
    const [firstEntry, secondEntry, thirdEntry] = numericalInputs;

    const adjustedFirst = firstEntry - 1;
    const adjustedSecond = secondEntry - 1;

    // Determine an additional modifier based on adjustedFirst and adjustedSecond
    // This replaces the 'if' conditional with a ternary operator
    const additionalModifier = (adjustedFirst % 3 === 2) ? 0 : Math.floor(adjustedSecond / 2);

    // Define the various constant terms used in the final computation
    const baseConstant = 196471;
    const multiplierForFirst = 195;
    const multiplierForFirstDiv3 = 5;
    const multiplierForSecond = 20;

    // Construct a sequence of values that, when summed, yield the final result
    // This uses a functional reduction for the final sum
    const calculationComponents = [
        baseConstant,
        -adjustedFirst * multiplierForFirst,
        -Math.floor(adjustedFirst / 3) * multiplierForFirstDiv3,
        -adjustedSecond * multiplierForSecond,
        additionalModifier,
        -thirdEntry
    ];

    return calculationComponents.reduce((accumulatedValue, currentComponent) => accumulatedValue + currentComponent, 0);
};

// Read all standard input synchronously as a single string
const entireInputContent = filesystem.readFileSync('/dev/stdin', 'utf8');

// Split the content into individual lines and remove any empty lines
const processedInputLines = entireInputContent.split('\n').filter(entry => entry.trim() !== '');

// The initial line specifies the number of data sets to process
const numberOfDataSets = Number(processedInputLines.shift());

// Create an array of results by iterating 'numberOfDataSets' times.
// This approach mirrors the original's behavior of crashing if too few data lines are provided.
const finalOutputValues = Array.from({ length: numberOfDataSets })
    .map((_, idx) => {
        // Retrieve the current line; if undefined, .split() will cause a TypeError,
        // replicating the original's error for insufficient input data.
        const currentDataLine = processedInputLines[idx];
        return currentDataLine.split(' ').map(Number); // Convert string parts to numbers
    })
    .map(transformCalculation); // Apply the core transformation to each set of numbers

// Print all computed results, each on a new line
console.log(finalOutputValues.join('\n'));