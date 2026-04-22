// This primary function is responsible for processing a given input string and generating a structured output.
// It takes a single string parameter which is expected to contain numerical data.
function ExecuteRoutine(rawInputText) {
    // The input string is first split into individual string components based on spaces.
    // Each component is then converted into an integer, forming an array of numbers.
    let numericValues = rawInputText
        .split(" ")
        .map(stringValue => parseInt(stringValue, 10));

    // Initialize variables that will store the two main numerical inputs
    // and the two distinct character patterns used in the output grid.
    let primaryValue, secondaryValue, firstCharPattern, secondCharPattern;

    // A conditional block determines which of the two input numbers is larger.
    // Based on this comparison, `primaryValue` and `secondaryValue` are assigned.
    // Correspondingly, two character patterns ('.', '#') are assigned to
    // `firstCharPattern` and `secondCharPattern` to define the grid's visual elements.
    if (numericValues[0] > numericValues[1]) {
        primaryValue = numericValues[0];
        secondaryValue = numericValues[1];
        firstCharPattern = "."; // Represents a 'filled' or 'positive' grid cell
        secondCharPattern = "#"; // Represents an 'empty' or 'negative' grid cell
    } else {
        secondaryValue = numericValues[0];
        primaryValue = numericValues[1];
        secondCharPattern = "."; // In this case, '.' is the 'empty' cell
        firstCharPattern = "#"; // And '#' is the 'filled' cell
    }

    // Calculate the overall square dimension for the output grid.
    // This involves taking the square root of the `primaryValue`, rounding it up,
    // and then scaling it by a factor of four.
    const gridDimension = Math.ceil(Math.sqrt(primaryValue)) * 4;

    // Define several constant array patterns that will be used to construct rows
    // within the output grid. These patterns utilize the `firstCharPattern` and `secondCharPattern`.
    const patternGroupA = [firstCharPattern, firstCharPattern, firstCharPattern, secondCharPattern];
    const patternGroupB = [firstCharPattern, secondCharPattern, firstCharPattern, secondCharPattern];
    const patternGroupC = [secondCharPattern, secondCharPattern, secondCharPattern, secondCharPattern];

    // Initialize an empty array that will eventually hold the complete output matrix,
    // where each element will be a row of characters.
    let outputMatrix = [];

    // Initialize two counters, which will track progress against the `primaryValue`
    // and `secondaryValue` during the grid generation process.
    let currentCountA = 1,
        currentCountB = 1;

    // The main loop iterates through the rows of the grid, advancing in steps of four.
    // Each iteration corresponds to building a 4-row block of the output matrix.
    for (let rowBlockIndex = 0; rowBlockIndex < gridDimension; rowBlockIndex += 4) {
        // For each 4-row block, initialize four new empty arrays within the `outputMatrix`.
        outputMatrix[rowBlockIndex] = [];
        outputMatrix[rowBlockIndex + 1] = [];
        outputMatrix[rowBlockIndex + 2] = [];
        outputMatrix[rowBlockIndex + 3] = [];

        // An inner loop iterates through the columns of the grid, also in steps of four.
        // This loop populates the 4-row block with character patterns.
        for (let colBlockIndex = 0; colBlockIndex < gridDimension; colBlockIndex += 4) {
            // Special condition for the very first 4x4 block of the grid (top-left corner).
            if (rowBlockIndex === 0 && colBlockIndex === 0) {
                outputMatrix[rowBlockIndex].push(...patternGroupA);
                outputMatrix[rowBlockIndex + 1].push(...patternGroupA);
                outputMatrix[rowBlockIndex + 2].push(...patternGroupA);
                outputMatrix[rowBlockIndex + 3].push(...patternGroupC);
            }
            // Condition for when `currentCountA` has reached its target `primaryValue`.
            // In this state, the block is filled entirely with `patternGroupC`.
            else if (currentCountA === primaryValue) {
                outputMatrix[rowBlockIndex].push(...patternGroupC);
                outputMatrix[rowBlockIndex + 1].push(...patternGroupC);
                outputMatrix[rowBlockIndex + 2].push(...patternGroupC);
                outputMatrix[rowBlockIndex + 3].push(...patternGroupC);
            }
            // Condition for when `currentCountB` has reached its target `secondaryValue`.
            // This block uses `patternGroupA` for the first three rows and `patternGroupC` for the fourth.
            // `currentCountA` is also incremented in this case.
            else if (currentCountB === secondaryValue) {
                outputMatrix[rowBlockIndex].push(...patternGroupA);
                outputMatrix[rowBlockIndex + 1].push(...patternGroupA);
                outputMatrix[rowBlockIndex + 2].push(...patternGroupA);
                outputMatrix[rowBlockIndex + 3].push(...patternGroupC);
                currentCountA++;
            }
            // The default case, applied when neither of the above specific conditions are met.
            // This block uses a mix of `patternGroupA` and `patternGroupB`, and increments both counters.
            else {
                outputMatrix[rowBlockIndex].push(...patternGroupA);
                outputMatrix[rowBlockIndex + 1].push(...patternGroupB);
                outputMatrix[rowBlockIndex + 2].push(...patternGroupA);
                outputMatrix[rowBlockIndex + 3].push(...patternGroupC);
                currentCountA++;
                currentCountB++;
            }
        }
    }

    // After the matrix is fully populated with character arrays,
    // this loop converts each inner array (representing a row) into a single string.
    for (let currentOutputRow = 0; currentOutputRow < gridDimension; currentOutputRow++) {
        outputMatrix[currentOutputRow] = outputMatrix[currentOutputRow].join("");
    }

    // Finally, the calculated grid dimensions and the entire generated matrix
    // (with rows joined by newline characters) are printed to the console.
    console.log("%d %d\n%s", gridDimension, gridDimension, outputMatrix.join("\n"));
}

// This line executes the `ExecuteRoutine` function.
// It reads the entire content of standard input (`/dev/stdin`) as a UTF-8 string,
// removes any leading or trailing whitespace, and then passes it to the function.
ExecuteRoutine(
    require("fs").readFileSync("/dev/stdin", "utf8").trim()
);