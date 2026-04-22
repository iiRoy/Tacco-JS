// This utility function processes a given string of raw data to perform specific calculations.
function ProcessInputData(rawDataString)
{
    // The initial input string is split into an array of lines based on newline characters.
    let linesOfText = rawDataString.split("\n");

    // The first line is further parsed to extract configuration tokens, typically space-separated.
    let firstLineTokens = linesOfText[0].split(" ");

    // The total number of data elements to process is derived from the first token of the first line.
    const totalElements = parseInt(firstLineTokens[0]);

    // An array is instantiated to store the numerical data values, initially filled with zeros.
    let dataValues = new Array(totalElements).fill(0);

    // A variable to keep track of the smallest value encountered so far, initialized to a very large number.
    let currentMinimum = Number.MAX_SAFE_INTEGER;

    // A variable to store the largest difference found between an element and the current minimum.
    let maximumDifference = 0;

    // A counter for how many times the maximum difference has been observed.
    let countOfMaxDiff = 0;

    // A loop iterates through each data element to analyze its properties and update statistics.
    for (let elementIndex = 0; elementIndex < totalElements; elementIndex++)
    {
        // Each data value is parsed from the second line of the input, at the corresponding index.
        dataValues[elementIndex] = parseInt(linesOfText[1].split(" ")[elementIndex]);

        // If the current data value is smaller than the recorded minimum, the minimum is updated.
        if (currentMinimum > dataValues[elementIndex])
        {
            currentMinimum = dataValues[elementIndex];
        }

        // Evaluate if the difference between the current value and the minimum matches the current maximum difference.
        if (maximumDifference === dataValues[elementIndex] - currentMinimum)
        {
            countOfMaxDiff++; // If it matches, increment the counter for maximum difference occurrences.
        }
        // Alternatively, if the current difference is greater than the recorded maximum difference.
        else if (maximumDifference < dataValues[elementIndex] - currentMinimum)
        {
            // A new maximum difference has been found, so reset the counter and update the maximum difference.
            countOfMaxDiff = 1;
            maximumDifference = dataValues[elementIndex] - currentMinimum;
        }
    }

    // The final count of occurrences of the maximum difference is printed to the console.
    console.log('%s', countOfMaxDiff);
}

// This section handles the program's entry point, reading input from the standard input stream.
// A reference to the module loading mechanism is stored.
const obtainModule = require;
// The file system helper module is loaded.
const fileSysHelper = obtainModule("fs");
// The synchronous file content reading function is aliased.
const fetchContentSync = fileSysHelper.readFileSync;

// The main processing function is invoked with data read from standard input, converted to a string.
ProcessInputData(fetchContentSync("/dev/stdin", "utf8").toString());