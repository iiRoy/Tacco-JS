let lineBreak = '\n'; /* This variable stores the newline character for output formatting. */

// The core logic is encapsulated within this single, compact for loop statement.
// Initialization Phase:
//   - 'firstCounter', 'secondCounter', 'fourthCounter', and 'thirdCounter' are all initialized to zero.
//   - 'inputElements' is populated by reading data from standard input ('/dev/stdin'),
//     decoding it as UTF-8, and then splitting the content into an array using
//     either whitespace or a comma as delimiters.
//   - 'currentElement' is declared but not yet assigned, and 'elementIndex' is set to -1.
// Loop Condition:
//   - 'elementIndex' is first incremented by 2 (e.g., -1 becomes 1, then 3, 5, etc.).
//   - 'currentElement' is then assigned the value from the 'inputElements' array at the
//     newly calculated 'elementIndex'.
//   - The loop continues as long as 'currentElement' is a truthy value (i.e., not undefined,
//     which would happen when the index goes out of bounds).
for (
    let firstCounter = 0, secondCounter = 0, fourthCounter = 0, thirdCounter = 0,
        inputElements = require("fs").readFileSync("/dev/stdin", "utf8").split(/\s|,/),
        currentElement, elementIndex = -1;
    currentElement = inputElements[elementIndex += 2];
) {
    // Inside the loop, the current 'elementIndex' and its corresponding 'currentElement' value
    // are printed to the console. This can be useful for tracing the loop's progress.
    console.log(elementIndex, currentElement);

    // A nested ternary operator is used to conditionally increment one of the four counters.
    // - If 'currentElement' is 'A', 'firstCounter' is incremented.
    // - Else if 'currentElement' is 'B', 'secondCounter' is incremented.
    // - Else if 'currentElement' is 'O', 'thirdCounter' is incremented.
    // - For any other value, 'fourthCounter' is incremented.
    currentElement === 'A'
        ? firstCounter++
        : currentElement === 'B'
            ? secondCounter++
            : currentElement === 'O'
                ? thirdCounter++
                : fourthCounter++; // This handles all other cases.
}

// After the loop has finished processing all relevant elements, the final counts
// for 'firstCounter', 'secondCounter', 'fourthCounter', and 'thirdCounter' are
// printed to the console, each separated by the 'lineBreak' character.
console.log(
    firstCounter + lineBreak +
    secondCounter + lineBreak +
    fourthCounter + lineBreak +
    thirdCounter
);
