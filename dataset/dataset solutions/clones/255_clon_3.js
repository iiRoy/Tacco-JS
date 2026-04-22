// This module is designed to process a specialized numerical input string.
// Its primary function is to extract specific numeric values based on a predefined pattern,
// count the occurrences of these extracted numbers, and then report any numbers
// that appear more than once, along with their respective frequencies.

// Define a constant for the regular expression pattern used to identify and effectively
// remove certain delimiters and numbers from the input string.
// This pattern matches a comma, followed by one or more digits, optionally followed by newlines.
// The 'g' flag ensures all occurrences are replaced.
const INPUT_DELIMITER_PATTERN = /,\d+\n{0,}/g;

// Assume 'input' is a string variable provided from an external source,
// e.g., a function parameter, file read operation, or standard input.
// Example content for 'input': "10,20,30,40,50,30,10,60,70,80,90,100"

// Perform an initial transformation and parsing of the raw input string.
// The original code's `split(/,\d+\n{0,}/)` behavior effectively filters out
// certain numbers by using them as split delimiters. To replicate this,
// we first replace all occurrences of the delimiter pattern with a single comma.
// Then, we split the modified string by commas, which will result in an array
// containing the numbers we want to process, along with potential empty strings
// if multiple delimiters were consecutive. Finally, `filter(Boolean)` removes
// these empty strings, yielding an array of string representations of the numbers.
const elementsForProcessing = input
    .replace(INPUT_DELIMITER_PATTERN, ',') // Replace all delimiter sequences with a single comma
    .split(',')                          // Split the string into parts using the comma as a separator
    .filter(Boolean);                    // Remove any empty strings that resulted from the split

// Initialize an array that will serve as a frequency map (or hash table).
// Array indices will represent the numeric values, and the values at those indices
// will store their respective counts. This is efficient for non-negative integer keys.
const numberFrequencyMap = [];

// Determine the upper bound for the first processing loop.
// This variable holds the total count of string elements obtained after initial parsing.
const processingElementCount = elementsForProcessing.length;

// Iterate through each string element in the `elementsForProcessing` array.
for (let currentElementIndex = 0; currentElementIndex < processingElementCount; currentElementIndex++) {
    // Parse the current string element into an integer.
    // `.trim()` is added for robustness against leading/trailing whitespace, and `10` specifies radix.
    const parsedNumericValue = parseInt(elementsForProcessing[currentElementIndex].trim(), 10);

    // Validate that the parsed value is indeed a valid number.
    // If `isNaN` returns true, it means the parsing failed, and we skip this element.
    if (!isNaN(parsedNumericValue)) {
        // Increment the frequency count for the `parsedNumericValue`.
        // If this number hasn't been encountered before, `numberFrequencyMap[parsedNumericValue]`
        // will be `undefined`, so `(undefined || 0)` evaluates to `0`, ensuring correct initialization.
        numberFrequencyMap[parsedNumericValue] = (numberFrequencyMap[parsedNumericValue] || 0) + 1;
    }
}

// Determine the maximum possible number key encountered in the frequency map.
// This sets the upper limit for iterating through the frequency map in the next step.
const highestRecordedNumber = numberFrequencyMap.length;

// Initialize an array to store the formatted output strings.
// This approach is generally more efficient than repeated string concatenation.
const outputResultLines = [];

// Iterate through the `numberFrequencyMap` from index 0 up to the `highestRecordedNumber`.
// This allows us to check every possible number that could have been counted.
for (let numberKey = 0; numberKey < highestRecordedNumber; numberKey++) {
    // Retrieve the count for the current `numberKey`.
    const currentNumberCount = numberFrequencyMap[numberKey];

    // Check if the number exists in our frequency map (i.e., it was encountered)
    // and if its count is strictly greater than one.
    if (currentNumberCount !== undefined && currentNumberCount > 1) {
        // If the conditions are met, format the output string using a template literal
        // and add it to our `outputResultLines` array.
        outputResultLines.push(`${numberKey} ${currentNumberCount}`);
    }
}

// Join all the accumulated output lines with a newline character between them
// and print the final string to the console. If no numbers met the criteria,
// the `outputResultLines` array will be empty, resulting in an empty string being logged.
console.log(outputResultLines.join('\n'));