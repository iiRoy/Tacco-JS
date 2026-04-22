// This function analyzes a string of numerical data.
function ProcessInput(rawData) {
    // First, clean up the raw text, split into parts, and convert to numbers.
    // The radix (base 10) is explicitly provided for robustness.
    let numericValues = rawData.trim()
                               .split(' ')
                               .map(item => parseInt(item, 10));

    // Check if the first value is less than or equal to the third value
    // AND if the sum of the first and second values is greater than or equal to the third value.
    if ( numericValues [ 0 ] <= numericValues [ 2 ] && ( numericValues [ 0 ] + numericValues [ 1 ] ) >= numericValues [ 2 ] )
    {
        console.log("YES"); // Indicate the condition is met.
    }
    else
    {
        console.log("NO"); // Indicate the condition is not met.
    }
}

// Read the content from standard input synchronously and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));