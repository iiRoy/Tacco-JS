// Retrieve raw content from the standard input stream
let dataSource = require('fs').readFileSync('/dev/stdin', 'utf-8');

// Normalize and segment the input string into separate entries
let dataRows = dataSource.trim().split('\n');

// Declare variables to hold processing state and counts
let currentRecord;
let rightAngleShapes = 0; // Accumulator for figures meeting the Pythagorean condition
let equalSideShapes = 0;  // Accumulator for figures with two identical side lengths

// Iterate through each available data entry
while ((currentRecord = dataRows.shift()) !== undefined) {
    // Parse the current line: split by comma and convert each part to a numeric type
    const parsedValues = currentRecord.split(',').map((item) => {
        return Number(item);
    });

    // Extract the three numeric components into distinct variables for clarity
    const sideA = parsedValues[0];
    const sideB = parsedValues[1];
    const sideC = parsedValues[2];

    // Evaluate if the current set of sides satisfies the Pythagorean theorem (a^2 + b^2 = c^2)
    if ((sideA * sideA + sideB * sideB) === (sideC * sideC)) {
        rightAngleShapes++; // Increment the counter for right-angled forms
    }
    // Otherwise, check if the first two sides have identical lengths
    else if (sideA === sideB) {
        equalSideShapes++;  // Increment the counter for forms with two equal sides
    }
}

// Output the final tally of right-angled geometric figures
console.log(rightAngleShapes);

// Output the final tally of geometric figures possessing two equal sides
console.log(equalSideShapes);