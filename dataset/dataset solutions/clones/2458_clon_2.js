function processSequenceData( rawDataString )
{
    // Split the entire input string into an array of individual lines.
    let inputLines = rawDataString.split("\n");

    // Extract the first line and then split it into an array of characters, representing the core pattern.
    const symbolPattern = inputLines[0].split("");

    // Calculate the effective length for our subsequent data structures, which is one greater than the symbol pattern's length.
    const patternLength = symbolPattern.length + 1;

    // This variable serves as a placeholder; its value is initialized but not utilized in the main computation.
    let unusedPlaceholder = 0;

    // Initialize the variable that will accumulate the final calculated score.
    let totalScore = 0;

    // Create an array to act as markers for specific positions within the sequence, initially uninitialized (undefined).
    let boundaryIndices = new Array(patternLength);

    // --- First Iteration: Identify and set initial boundary markers ---
    // Loop through the symbol pattern, stopping before the very last element.
    for ( let charIndex = 0; charIndex < patternLength - 1; charIndex++ )
    {
        // Check for a '<' at the beginning of the sequence.
        if ( charIndex === 0 && symbolPattern[charIndex] === "<" ) {
            boundaryIndices[charIndex] = 0; // Mark this specific index.
        }
        // Check for a transition where a '>' is immediately followed by a '<'.
        else if ( symbolPattern[charIndex] === ">" && symbolPattern[charIndex + 1] === "<" ) {
            boundaryIndices[charIndex + 1] = 0; // Mark the index after the '>' (where '<' starts).
        }
        // Check for a '>' at the second-to-last position of the pattern.
        else if ( charIndex === patternLength - 2 && symbolPattern[charIndex] === ">" ) {
            boundaryIndices[charIndex + 1] = 0; // Mark the very last index.
        }
    }


    // Initialize counters for consecutive '<' and '>' characters.
    let leftRunCount = 0;  // Counter for left-to-right accumulation.
    let rightRunCount = 0; // Counter for right-to-left accumulation.

    // Initialize arrays to store accumulated scores from both directions, filled with zeros.
    let forwardScores = new Array(patternLength).fill(0);
    let backwardScores = new Array(patternLength).fill(0);


    // --- Second Iteration: Calculate cumulative scores from both ends ---
    // This loop simultaneously processes the sequence from left-to-right and right-to-left.
    for ( let position = 0; position < patternLength - 1; position++ )
    {
        // Reset the left counter if the current position is marked as a boundary.
        if ( boundaryIndices[position] === 0 ) {
            leftRunCount = 0;
        }

        // Process the symbol pattern from left to right.
        if ( symbolPattern[position] === "<" ) {
            leftRunCount++;
            forwardScores[position + 1] = leftRunCount; // Store the incremented count.
        } else {
            leftRunCount = 0;
            forwardScores[position + 1] = leftRunCount; // Reset count if not '<'.
        }


        // Determine the mirrored position for the right-to-left scan.
        let reversePosition = patternLength - 1 - position;

        // Reset the right counter if the mirrored position is marked as a boundary.
        if ( boundaryIndices[reversePosition] === 0 ) {
            rightRunCount = 0;
        }

        // Process the symbol pattern from right to left.
        if ( symbolPattern[patternLength - 2 - position] === ">" ) {
            rightRunCount++;
            backwardScores[patternLength - 2 - position] = rightRunCount; // Store the incremented count.
        } else {
            rightRunCount = 0;
            backwardScores[patternLength - 2 - position] = rightRunCount; // Reset count if not '>'.
        }
    }


    // Re-initialize the total score before the final summation.
    totalScore = 0;

    // --- Final Iteration: Aggregate the maximum scores ---
    // Iterate through all positions in the generated score arrays.
    for ( let currentIdx = 0; currentIdx < patternLength; currentIdx++ )
    {
        // Only add to the total score if the current position was NOT marked as an initial boundary (i.e., it's undefined or not 0).
        if ( boundaryIndices[currentIdx] !== 0 ) {
            totalScore += Math.max(forwardScores[currentIdx], backwardScores[currentIdx]);
        }
    }


    // Output the final computed total score to the standard console.
    console.log('%s', totalScore);

    // Return the calculated score.
    return totalScore;
}


// This auxiliary function is designed for local testing and verifying the correctness of outputs.
function validateTestCases( testIdentifier )
{
    // Fetch the input value associated with the given test identifier from a DOM element.
    const sourceElementValue = document.getElementById("input" + testIdentifier).value;

    // Execute the main processing function with the retrieved input.
    let calculatedValue = processSequenceData(sourceElementValue);

    // Initialize the outcome string, defaulting to "Wrong Answer".
    let validationOutcome = "WA";

    // Compare the result obtained from our function with the expected output from another DOM element.
    if ( calculatedValue == document.getElementById("output" + testIdentifier).value.split("\n")[0] ) {
        validationOutcome = "AC"; // If they match, update the outcome to "Accepted".
    }

    // Update the inner HTML of a designated result element with the determined validation outcome.
    document.getElementById("result" + testIdentifier).innerHTML = validationOutcome;
}


// The primary entry point for execution, typically used in a competitive programming setup.
// It reads input from standard input and then calls the main processing function.
processSequenceData(require("fs").readFileSync("/dev/stdin", "utf8"));