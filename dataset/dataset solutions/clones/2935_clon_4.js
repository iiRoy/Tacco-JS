const calculateOverlapCount = (rawTextualInput) => {
    const textualSegments = rawTextualInput.trim().split('\n');

    // Discard the first line containing metadata (N and M values).
    // The number of actual ranges is inferred from the remaining lines.
    const rangeSpecifications = textualSegments.slice(1).map(lineContent => {
        // Parse the two values on each line as strings, to replicate the original's string comparison behavior.
        const [leftBoundaryString, rightBoundaryString] = lineContent.split(' ');
        return { lowerString: leftBoundaryString, upperString: rightBoundaryString };
    });

    // Assume at least one range is provided, as per typical problem constraints.
    // Initialize the aggregate string values with the first range's values,
    // mimicking the original code's variable initialization.
    let currentMaxLowerString = rangeSpecifications[0].lowerString;
    let currentMinUpperString = rangeSpecifications[0].upperString;

    // Determine the "maximum" lower bound using string comparison.
    // This replicates a potential behavior quirk (string vs. numeric comparison) from the original.
    currentMaxLowerString = rangeSpecifications.reduce((accumulatedMax, currentSpec) => {
        return accumulatedMax > currentSpec.lowerString ? accumulatedMax : currentSpec.lowerString;
    }, currentMaxLowerString); // Start reduction with the first element's lower string.

    // Determine the "minimum" upper bound using string comparison.
    // This also replicates the original's behavior.
    currentMinUpperString = rangeSpecifications.reduce((accumulatedMin, currentSpec) => {
        return accumulatedMin < currentSpec.upperString ? accumulatedMin : currentSpec.upperString;
    }, currentMinUpperString); // Start reduction with the first element's upper string.

    // Convert the final string-compared values to numbers for arithmetic.
    const finalNumericMaxLower = Number(currentMaxLowerString);
    const finalNumericMinUpper = Number(currentMinUpperString);

    // Calculate the potential count of integers within the overlapping range.
    const potentialSpanValue = finalNumericMinUpper - finalNumericMaxLower + 1;

    // Ensure the result is not negative; if no overlap or negative span, the count is zero.
    return Math.max(0, potentialSpanValue);
};

const externalSource = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(calculateOverlapCount(externalSource));