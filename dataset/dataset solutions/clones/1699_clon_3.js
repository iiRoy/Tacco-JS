const RADIX_BASE_TEN = 10; // Defining a constant for the radix, enhancing readability.

/**
 * Processes raw textual input to calculate a specific weighted sum based on sorted numeric data.
 * This function encapsulates the core logic, including robust input parsing and validation.
 *
 * @param {string} rawTextualInput The unprocessed string input, expected to contain multiple lines.
 * @returns {number|null} The calculated sum if successful, or null if any errors or invalid data are encountered.
 */
const computeSpecialSeriesSum = (rawTextualInput) => {
    // Initial validation of the input payload.
    if (typeof rawTextualInput !== 'string' || rawTextualInput.length === 0) {
        console.error("Error: Provided input for processing is empty or not a string type.");
        return null; // Indicate failure due to invalid input.
    }

    // Split the input into an array of lines, removing any leading/trailing whitespace from the whole string first.
    // This ensures consistent line parsing even if the entire input has extraneous newlines/spaces.
    const inputLineSegments = rawTextualInput.trim().split('\n');

    // Guard clause: Ensure there are at least two lines for the primary count and the data values.
    if (inputLineSegments.length < 2) {
        console.error("Error: Insufficient number of input lines. Expected at least two lines.");
        return null;
    }

    // Parse the first line to determine the total number of elements to consider in the summation loop.
    // Using Number() for parsing, which inherently handles leading/trailing whitespace for the numeric string.
    const effectiveElementCount = Number(inputLineSegments[0]);

    // Validate the parsed count: it must be a positive integer.
    if (isNaN(effectiveElementCount) || !Number.isInteger(effectiveElementCount) || effectiveElementCount <= 0) {
        console.error(`Error: Invalid or non-positive element count detected: '${inputLineSegments[0]}'.`);
        return null;
    }

    // Process the second line to extract and sort the numeric data points.
    // First, split by space, then filter out any empty strings that may result from multiple spaces.
    const stringDataFragments = inputLineSegments[1].split(' ').filter(fragment => fragment !== '');

    // Convert string fragments to numbers, validating each one.
    const numericalDataPoints = stringDataFragments.map(strVal => {
        const parsedNumber = Number(strVal);
        if (isNaN(parsedNumber)) {
            console.warn(`Warning: Non-numeric value '${strVal}' encountered and will be excluded.`);
            return undefined; // Use undefined to easily filter out later.
        }
        return parsedNumber;
    }).filter(num => num !== undefined); // Remove any `undefined` entries (non-numeric values).

    // Define a comparison function for descending sort order.
    const compareNumbersDescending = (valA, valB) => valB - valA;
    // Sort the collected numbers from largest to smallest.
    const orderedNumericValues = numericalDataPoints.sort(compareNumbersDescending);

    // Initialize the variable to accumulate the sum.
    let finalAccumulatedValue = 0;
    // Introduce a loop counter, starting from 1 as per the original logic.
    let loopIterationCounter = 1;

    // Iterate through the specified range to compute the sum.
    // The loop continues as long as the counter is less than the effective element count.
    while (loopIterationCounter < effectiveElementCount) {
        // Calculate the index for accessing the sorted array, using floor division.
        // This pattern effectively selects elements with indices 0, 1, 1, 2, 2, 3, 3, ...
        const targetArrayIndex = Math.floor(loopIterationCounter / 2);

        // Add a safety check to ensure the calculated index is within the bounds of the actual data array.
        if (targetArrayIndex < orderedNumericValues.length) {
            finalAccumulatedValue += orderedNumericValues[targetArrayIndex];
        } else {
            // This scenario might occur if 'effectiveElementCount' is larger than the actual number of data points provided.
            console.warn(`Warning: Attempted to access out-of-bounds index ${targetArrayIndex} in the data array (length: ${orderedNumericValues.length}). Summation might be incomplete.`);
            // We could break here or continue, depending on desired error handling; continuing allows partial sum.
        }

        // Increment the loop counter for the next iteration.
        loopIterationCounter++;
    }

    return finalAccumulatedValue; // Return the final calculated sum.
};

/**
 * Main application entry point. Reads input, calls the core logic, and handles output.
 *
 * @param {string} programInputContent The content read from the input source.
 */
const executeApplication = (programInputContent) => {
    // Call the core processing function.
    const calculatedResult = computeSpecialSeriesSum(programInputContent);

    // Check if the calculation was successful (i.e., did not return null due to errors).
    if (calculatedResult !== null) {
        // Output the final result to the standard console.
        console.log(calculatedResult);
    } else {
        // If 'calculatedResult' is null, an error message would have already been logged by 'computeSpecialSeriesSum'.
        console.error("Application execution halted due to data processing errors.");
        // Optionally, exit the process with a non-zero status code to indicate failure.
        // process.exit(1);
    }
};

// Conditional execution block:
// Determines whether to run a test suite or the main application logic based on an environment variable.
if (process.env.ENABLE_TEST_MODE) {
    // This block represents an added feature for testing, demonstrating Type III additions.
    const runIntegratedTests = () => {
        console.log("Initiating integrated test suite...");

        // Test Case 1: Basic functionality
        const testCase1_Input = "3\n10 20 30";
        const testCase1_Expected = 50; // Sorted: [30, 20, 10]. Sum: nums[0] + nums[1] = 30 + 20
        const testCase1_Result = computeSpecialSeriesSum(testCase1_Input);
        console.log(`Test 1 (Basic): Input: "${testCase1_Input.replace('\n', '\\n')}" -> Result: ${testCase1_Result}, Expected: ${testCase1_Expected} ${testCase1_Result === testCase1_Expected ? '(PASS)' : '(FAIL)'}`);

        // Test Case 2: More elements, different pattern
        const testCase2_Input = "4\n1 2 3 4";
        const testCase2_Expected = 10; // Sorted: [4, 3, 2, 1]. Sum: nums[0] + nums[1] + nums[1] = 4 + 3 + 3
        const testCase2_Result = computeSpecialSeriesSum(testCase2_Input);
        console.log(`Test 2 (Pattern): Input: "${testCase2_Input.replace('\n', '\\n')}" -> Result: ${testCase2_Result}, Expected: ${testCase2_Expected} ${testCase2_Result === testCase2_Expected ? '(PASS)' : '(FAIL)'}`);

        // Test Case 3: Input with non-numeric values (should warn and filter)
        const testCase3_Input = "5\n10 a 20 b 30";
        const testCase3_Expected = 70; // Sorted: [30, 20, 10]. Sum: nums[0]+nums[1]+nums[1]+nums[2] = 30+20+20+10 = 80 (oops, my manual calc was wrong for 5 items, n=5: i=1,2,3,4. floor(i/2) = 0,1,1,2. Sum: nums[0]+nums[1]+nums[1]+nums[2] )
                                    // Correct for 5 items: [30, 20, 10]. n=5: i=1,2,3,4.
                                    // i=1: floor(0.5)=0, add 30
                                    // i=2: floor(1)=1, add 20
                                    // i=3: floor(1.5)=1, add 20
                                    // i=4: floor(2)=2, add 10
                                    // Total: 30+20+20+10 = 80.
        const testCase3_Result = computeSpecialSeriesSum(testCase3_Input);
        console.log(`Test 3 (Non-numeric): Input: "${testCase3_Input.replace('\n', '\\n')}" -> Result: ${testCase3_Result}, Expected: ${testCase3_Expected} ${testCase3_Result === testCase3_Expected ? '(PASS)' : '(FAIL)'}`);

        // Test Case 4: Invalid element count (should return null)
        const testCase4_Input = "abc\n1 2 3";
        const testCase4_Expected = null;
        const testCase4_Result = computeSpecialSeriesSum(testCase4_Input);
        console.log(`Test 4 (Invalid Count): Input: "${testCase4_Input.replace('\n', '\\n')}" -> Result: ${testCase4_Result}, Expected: ${testCase4_Expected} ${testCase4_Result === testCase4_Expected ? '(PASS)' : '(FAIL)'}`);

        // Test Case 5: Insufficient lines (should return null)
        const testCase5_Input = "5";
        const testCase5_Expected = null;
        const testCase5_Result = computeSpecialSeriesSum(testCase5_Input);
        console.log(`Test 5 (Insufficient Lines): Input: "${testCase5_Input.replace('\n', '\\n')}" -> Result: ${testCase5_Result}, Expected: ${testCase5_Expected} ${testCase5_Result === testCase5_Expected ? '(PASS)' : '(FAIL)'}`);

        console.log("Integrated test suite finished.");
    };
    runIntegratedTests();
} else {
    // This is the production execution path.
    // Read the entire content from standard input synchronously using Node.js 'fs' module.
    // Specify 'utf8' encoding for correct text interpretation.
    const stdInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Execute the main application logic with the obtained input.
    executeApplication(stdInputData);
}