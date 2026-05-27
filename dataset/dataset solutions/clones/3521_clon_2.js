// This function processes the entire input string provided to it.
function ProcessInput(rawData) {
    // The raw input string is split into an array of string representations of numbers,
    // using a space character as the delimiter.
    let numericValues = rawData.split(' ');

    // Each string element in the array is then converted into an integer.
    // The radix (base) of 10 is explicitly specified for parsing.
    numericValues = numericValues.map( (currentStr) => {
        return parseInt(currentStr, 10);
    });

    // The algorithm proceeds by repeatedly finding and extracting the maximum value
    // from the array to identify the three largest numbers.

    // First, determine the largest number among the initial set of values.
    let largestVal = Math.max(...numericValues);
    // Remove this largest number from the array to ensure it's not picked again.
    numericValues.splice(numericValues.indexOf(largestVal), 1);

    // Next, find the second largest number from the remaining values.
    let middleVal = Math.max(...numericValues);
    // Remove this second largest number from the array.
    numericValues.splice(numericValues.indexOf(middleVal), 1);

    // Finally, identify the third largest number from the last remaining value(s).
    let smallestVal = Math.max(...numericValues);
    // Remove this third largest number from the array.
    numericValues.splice(numericValues.indexOf(smallestVal), 1);

    // Perform the final calculation:
    // Concatenate the string forms of the largest and middle values,
    // parse this combined string back into an integer (base 10),
    // and then add the smallest of the three extracted values to it.
    console.log(parseInt(largestVal.toString() + middleVal.toString(), 10) + smallestVal);
}

// The following line is responsible for reading input from standard input
// and passing it to the main processing function. It should not be altered.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
