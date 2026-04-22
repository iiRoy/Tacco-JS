// This function processes a given string input to compute a specific numerical result.
function calculateOutput (sourceInputText) {
    // Split the input string by whitespace, filter out empty entries, and parse each into an integer.
    const processedNumbersArray = sourceInputText
                                    .split (/\s/g)
                                    .filter (itemString => itemString)
                                    .map (numberString => parseInt(numberString, 10));

    // Extract the second number from the parsed array, representing an upper boundary or limit.
    const upperBoundary = processedNumbersArray[1];

    // Extract the first number, indicating the total count or size of a collection.
    const collectionSize = processedNumbersArray[0];

    // Determine the final result based on a conditional expression.
    // If the upper boundary equals the collection size, the result is 1.
    // Otherwise, it's the collection size divided by (upper boundary minus 1).
    console.log(
        upperBoundary === collectionSize
            ? 1
            : collectionSize / (upperBoundary - 1)
    );
}

// Define constants for file path and encoding to enhance readability.
const standardInputPath = "/dev/stdin";
const fileEncoding = "utf8";

// Read the content from standard input synchronously using the file system module,
// then pass the retrieved text to our primary processing function.
calculateOutput(
    require("fs").readFileSync(standardInputPath, fileEncoding)
);