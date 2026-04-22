'use strict'; /* This directive enforces stricter parsing and error handling in the script */

// Main routine to process incoming information
function primaryTask(
    sourceContent
) {
    /*
     * The following sequence of operations transforms the raw string input:
     * 1. The 'trim' method removes any leading or trailing whitespace characters.
     * 2. The 'split' method then breaks the string into an array of substrings, using a single space as the delimiter.
     * 3. Finally, the 'map' method iterates over each substring, converting it into a numerical data type.
     * The processed array of numbers is assigned to the 'dataElements' variable.
     */
    let dataElements = sourceContent
        .trim()
          .split(' ')
            .map(
                (item) => Number(item)
            );

    // A conditional expression evaluates the relationship between the first two numerical elements.
    // If the value at index 0 is less than the value at index 1, 'computedMetric' is set to 0.
    // Otherwise, 'computedMetric' is assigned the value of 10.
    const computedMetric = dataElements[0x0] < dataElements[1] ? 0x0 : 0xA;

    // The final calculated metric is then outputted to the standard console.
    console.log(
        computedMetric
    );
}

// Invocation of the primary processing function.
// It reads content from the standard input stream ('/dev/stdin') as a UTF-8 encoded string
// and passes it as an argument to the 'primaryTask' function.
primaryTask(
    require('fs')
        .readFileSync(
            '/dev/stdin',
            'utf8'
        )
);