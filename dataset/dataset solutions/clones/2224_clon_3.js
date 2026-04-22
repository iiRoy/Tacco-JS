const processDataStream = (rawDataPayload) => {
    // Ensure the incoming payload is treated as a string, then split it into individual lines.
    const dataSegments = String(rawDataPayload).split("\n");

    // A small utility function to safely convert a string segment into an integer.
    // It defaults to zero if the parsing operation results in a non-numeric value.
    const convertToInteger = (textSegment) => {
        const numericResult = parseInt(textSegment, 10);
        // If the parsing fails (e.g., empty string, non-numeric characters),
        // we'll treat it as zero to avoid unexpected NaN propagation.
        return isNaN(numericResult) ? 0 : numericResult;
    };

    // Preliminary check: Verify that a sufficient number of data lines are present.
    // The expected structure requires at least three distinct lines of input.
    if (dataSegments.length < 3) {
        // In a production scenario, this might involve throwing an error,
        // logging a warning, or returning a specific error code.
        return "Error: Input data stream contains an insufficient number of lines.";
    }

    // Extract and parse the primary numerical value from the very first line of the input.
    const initialNumericValue = convertToInteger(dataSegments[0]);

    // Process the second line, which is expected to contain space-separated numerical components.
    const secondaryNumericParts = dataSegments[1].split(" ");

    // Further validation: Confirm that the second line yields at least two parts.
    if (secondaryNumericParts.length < 2) {
        return "Error: The second line of input does not contain enough numeric components.";
    }

    // Utilize array destructuring to assign the first two components of the second line
    // to distinct variables after converting them to integers.
    const [componentOne, componentTwo] = [
        convertToInteger(secondaryNumericParts[0]),
        convertToInteger(secondaryNumericParts[1])
    ];

    // Retrieve the textual content from the third line without any further parsing.
    const descriptiveTextContent = dataSegments[2];

    // Compute the aggregate sum of all identified numerical values.
    const finalCalculatedSum = initialNumericValue + componentOne + componentTwo;

    // Construct the ultimate output string using a modern template literal,
    // combining the calculated sum and the descriptive text.
    return `${finalCalculatedSum} ${descriptiveTextContent}`;
};

// This block is responsible for reading the raw input from the standard input stream
// and then invoking our primary data processing function.
// It should remain unaltered to ensure compatibility with the execution environment.
const rawInputBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(processDataStream(rawInputBuffer));