// Function to handle the primary data processing logic for constraints.
function processConstraints(dataPayload) {
    // Split the entire input string into individual lines.
    const allLines = dataPayload.split('\n');

    // Extract and parse the first line which contains the key parameters.
    // We assume the first line is always present and contains space-separated numbers.
    const parameterTokens = allLines[0].split(' ');

    // Safely parse integer values from the tokenized input.
    // Using the unary plus operator for numeric conversion is a concise alternative to parseInt.
    const totalItems = +parameterTokens[0];   // Corresponds to 'n'
    const limitX = +parameterTokens[1];       // Corresponds to 'x'
    const limitY = +parameterTokens[2];       // Corresponds to 'y'

    // Determine the maximum possible common count that satisfies both constraints.
    // This value is simply the smaller of the two limits provided.
    const maximumCommonCount = Math.min(limitX, limitY);

    // Initialize a variable to store the minimum required count.
    // This value will be calculated based on how many items are "missing" from each limit.
    let minimumRequiredCount = 0;

    // Calculate the baseline coverage: the number of items each limit would ideally cover
    // if items were distributed as evenly as possible (e.g., for two categories).
    const baseCoveragePerLimit = Math.floor(totalItems / 2);

    // Calculate the deficit for the first limit (limitX).
    // A deficit occurs if 'limitX' is less than the 'baseCoveragePerLimit'.
    // Math.max(0, ...) ensures that the deficit is never negative; if 'limitX'
    // is sufficient, its deficit is zero.
    const deficitForX = Math.max(0, baseCoveragePerLimit - limitX);

    // Similarly, calculate the deficit for the second limit (limitY).
    const deficitForY = Math.max(0, baseCoveragePerLimit - limitY);

    // The total minimum required count is the sum of the individual deficits.
    // This represents the smallest number of items that must fall into the combined
    // constrained categories to meet the overall criteria.
    minimumRequiredCount = deficitForX + deficitForY;

    // Output the computed maximum possible common count and the minimum required count.
    // A template literal is used for clear and modern string interpolation.
    console.log(`${maximumCommonCount} ${minimumRequiredCount}`);
}

// This block ensures the script reads input from standard I/O and calls the main processing function.
// It should not be modified to maintain compatibility with standard execution environments.
processConstraints(require("fs").readFileSync("/dev/stdin", "utf8"));