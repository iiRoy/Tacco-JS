const retrieveInputData = () => {
    try {
        return require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (error) {
        // In a production environment, this might involve more robust error logging
        // For competitive programming, this path is usually guaranteed to exist.
        console.error("Failed to read standard input:", error.message);
        return ""; // Return an empty string to allow the program to proceed gracefully
    }
};

const solveProblem = (problemInputString) => {
    // Step 1: Clean and split the raw input string into an array of individual lines.
    const inputLineArray = problemInputString.trim().split("\n");

    // Early exit for scenarios with no input or malformed input to prevent errors.
    if (inputLineArray.length === 0 || inputLineArray[0].trim() === "") {
        console.log(0); // If no valid input is provided, the maximum score is 0.
        return;
    }

    // Step 2: Parse the foundational parameters (N, M, Q) from the very first line of input.
    // Using `Number` for type conversion, which is an alternative to `parseInt`.
    const parsedFirstLine = inputLineArray[0].split(" ").map(Number);

    // Encapsulate the problem's core configuration into a structured object for clarity.
    const problemConfiguration = {
        sequenceLength: parsedFirstLine[0],       // Represents 'N' in the original problem.
        maxValueForElements: parsedFirstLine[1],  // Represents 'M' in the original problem.
        numberOfConstraints: parsedFirstLine[2],  // Represents 'Q' in the original problem.
    };

    // Basic validation of the parsed configuration values.
    // Ensures that 'N' and 'M' are positive integers, and 'Q' is a non-negative integer.
    if (!Number.isInteger(problemConfiguration.sequenceLength) || problemConfiguration.sequenceLength <= 0 ||
        !Number.isInteger(problemConfiguration.maxValueForElements) || problemConfiguration.maxValueForElements <= 0 ||
        !Number.isInteger(problemConfiguration.numberOfConstraints) || problemConfiguration.numberOfConstraints < 0) {
        console.log(0); // If parameters are invalid, output 0 as no meaningful calculation can be done.
        return;
    }

    // Step 3: Process the subsequent lines to build an array of constraint definitions.
    // Each constraint will be stored as an array: [indexA_0based, indexB_0based, requiredDifference, pointsAwarded].
    const constraintDefinitions = [];
    for (let currentConstraintIndex = 0; currentConstraintIndex < problemConfiguration.numberOfConstraints; ++currentConstraintIndex) {
        const lineData = inputLineArray[currentConstraintIndex + 1];

        // Guard against scenarios where the number of constraint lines is less than `numberOfConstraints`.
        if (!lineData) {
            // This indicates a malformed input where expected constraint lines are missing.
            // For Type III clone, we'll simply break or continue, effectively ignoring missing constraints.
            break;
        }

        const [a, b, c, d] = lineData.split(" ").map(Number);
        // Crucially, store the indices (a and b) as 0-based immediately.
        // This avoids repeated subtraction (-1) during the sequence evaluation phase, optimizing access.
        constraintDefinitions.push([a - 1, b - 1, c, d]);
    }

    // Initialize a variable to store the highest score obtained across all explored sequences.
    let globalMaximumScore = 0;

    // Step 4: Define the recursive Depth-First Search (DFS) function.
    // This function explores all possible non-decreasing sequences and evaluates their scores.
    // `currentLowerBound`: The minimum value that the next element in the sequence can take.
    // `currentPartialSequence`: The sequence being constructed in the current recursive call.
    const generateAndEvaluate = (currentLowerBound, currentPartialSequence) => {
        // Base Case: If the `currentPartialSequence` has reached the target `sequenceLength` (N elements).
        if (currentPartialSequence.length === problemConfiguration.sequenceLength) {
            let scoreForThisSequence = 0; // Accumulator for the score of the current complete sequence.

            // Iterate through every defined constraint to calculate the sequence's score.
            // Using a `for...of` loop for enhanced readability when iterating arrays.
            for (const singleConstraint of constraintDefinitions) {
                const [indexA, indexB, requiredDifference, pointsAwarded] = singleConstraint;

                // Check if the condition specified by the constraint is met.
                // `indexA` and `indexB` are already 0-based due to pre-processing.
                if (currentPartialSequence[indexB] - currentPartialSequence[indexA] === requiredDifference) {
                    scoreForThisSequence += pointsAwarded; // Add the awarded points if the condition is true.
                }
            }

            // Update `globalMaximumScore` if the score of the current sequence is higher.
            if (scoreForThisSequence > globalMaximumScore) {
                globalMaximumScore = scoreForThisSequence;
            }
            return; // Terminate this recursive branch as the sequence is complete.
        }

        // Recursive Step: Iterate to select the next element for the sequence.
        // The next element `nextElementValue` must be greater than or equal to `currentLowerBound`
        // and not exceed `maxValueForElements` (M).
        for (let nextElementValue = currentLowerBound; nextElementValue <= problemConfiguration.maxValueForElements; ++nextElementValue) {
            currentPartialSequence.push(nextElementValue); // Add the chosen value to the sequence.
            // Recursively call `generateAndEvaluate`, setting the new `currentLowerBound` to `nextElementValue`.
            // This ensures that subsequent elements maintain the non-decreasing property.
            generateAndEvaluate(nextElementValue, currentPartialSequence);
            currentPartialSequence.pop(); // Backtrack: Remove the last added element to explore other possibilities.
        }
    };

    // Step 5: Initiate the sequence generation and evaluation process.
    // Start with a `currentLowerBound` of 1 (as elements are positive integers) and an empty sequence.
    generateAndEvaluate(1, []);

    // Step 6: Output the final `globalMaximumScore` to the console.
    console.log(globalMaximumScore);
};

// Execute the main solution function, passing the input retrieved from standard input.
solveProblem(retrieveInputData());