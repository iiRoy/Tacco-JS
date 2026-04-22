function ExecuteNumericFlow(incomingText) {

    // This section initiates the processing of the raw input text.
    // The entire input string is first segmented into an array of lines.
    var textSegments = incomingText.split("\n") ;

    // The second line of input is processed to extract a series of space-separated values.
    // These values are initially stored as strings in an array for subsequent parsing.
    var elementStrings = textSegments[1].split(" ") ;

    // The first line of the input specifies the total quantity of elements.
    // This value is parsed as an integer and stored in a constant variable.
    const totalItemCount = parseInt(textSegments[0], 10);

    // A loop iterates through the initially string-based elements.
    // Each element is explicitly converted from a string to an integer type.
    for (var currentIdx = 0; currentIdx < totalItemCount; currentIdx++) {
        elementStrings[currentIdx] = parseInt(elementStrings[currentIdx], 10);
    }

    // A new array is initialized to store the results of intermediate computations.
    // The very first position in this array is set to a predefined initial value of zero.
    var calculatedResults = [];
    calculatedResults[0] = 0;

    // This loop performs the core calculation, starting from the second element.
    // It evaluates a specific condition to determine the value for each 'calculatedResults' entry.
    for (var currentIdx = 1; currentIdx < totalItemCount; currentIdx++) {
        // The condition checks if a derived value (based on previous and current elements) falls below zero.
        // The formula is: (previous element from 'elementStrings' + previous element from 'calculatedResults' - current element from 'elementStrings').
        if (elementStrings[currentIdx - 1] + calculatedResults[currentIdx - 1] - elementStrings[currentIdx] < 0) {
            // If the calculated value is negative, it is effectively floored to zero.
            calculatedResults[currentIdx] = 0;
        }
        else {
            // Otherwise, the direct result of the arithmetic expression is assigned.
            calculatedResults[currentIdx] = elementStrings[currentIdx - 1] + calculatedResults[currentIdx - 1] - elementStrings[currentIdx];
        }
    }

    // After populating the 'calculatedResults' array, a final summation is performed.
    // This loop aggregates all the values in the 'calculatedResults' array.
    var finalAccumulation = 0;
    for (var currentIdx = 0; currentIdx < totalItemCount; currentIdx++) {
        finalAccumulation += calculatedResults[currentIdx];
    }

    // The ultimate accumulated sum is then outputted to the standard console.
    console.log(finalAccumulation);
}

// The program's execution begins here. It calls the main processing function,
// providing it with input read synchronously from the standard input stream,
// using Node.js's file system module and UTF-8 encoding.
ExecuteNumericFlow(require("fs").readFileSync("/dev/stdin", "utf8"));