function processCharacterSequence(charSequence) {
    // Helper function to safely convert a character at a given index to a number.
    // This explicitly handles cases where the character might be undefined (e.g., short input string),
    // matching the original's implicit Number(undefined) -> NaN behavior during subtraction.
    const getNumericValue = (sequence, index) => {
        const char = sequence[index];
        return Number(char);
    };

    let outputDetermined = false; // Flag to ensure only one output, mimicking the 'break' statements.

    // Pre-fetch and convert the relevant character values to numbers.
    // This is an intermediate computation step and helper variables.
    const valueZero = getNumericValue(charSequence, 0);
    const valueOne = getNumericValue(charSequence, 1);
    const valueTwo = getNumericValue(charSequence, 2);
    const valueThree = getNumericValue(charSequence, 3);

    // Define the condition for all four values being distinct.
    // This is a rewriting of a local expression for clarity and reuse.
    const areAllFourValuesDistinct =
        (valueThree - valueTwo !== 0) &&
        (valueTwo - valueOne !== 0) &&
        (valueOne - valueZero !== 0);

    // The original code's loop structure with `input[++i]` and `break`
    // effectively creates a specific sequence of checks.
    // We replicate this sequence using explicit conditional blocks.

    // --- Mimic the first logical check (corresponding to i=0 in original loop) ---
    // Original: if (input[0] - input[1] == 0)
    if (valueZero - valueOne === 0) {
        console.log("Bad");
        outputDetermined = true;
    }
    // Original: else if (input[3] - input[2] && input[2] - input[1] && input[1] - input[0])
    // This check occurs if the first 'if' condition was false.
    else if (areAllFourValuesDistinct) {
        console.log("good");
        outputDetermined = true;
    }

    // --- Mimic the second logical check (corresponding to i=2 in original loop) ---
    // This block executes only if no output was determined by the previous checks.
    // Original: if (input[2] - input[3] == 0)
    if (!outputDetermined && (valueTwo - valueThree === 0)) {
        console.log("Bad");
        outputDetermined = true;
    }
    // Original: else if (input[3] - input[2] && input[2] - input[1] && input[1] - input[0])
    // This check occurs if the second 'if' condition was false and no output yet.
    else if (!outputDetermined && areAllFourValuesDistinct) {
        console.log("good");
        outputDetermined = true;
    }

    // --- Mimic the third logical check (corresponding to i=4 in original loop) ---
    // This block executes only if no output was determined by any previous checks.
    // The original 'if' condition for i=4 (input[4] - input[5] == 0) would always be false
    // because Number(undefined) - Number(undefined) results in NaN, and NaN === 0 is false.
    // Therefore, only the 'else if' part of this iteration is relevant.
    // Original: else if (input[3] - input[2] && input[2] - input[1] && input[1] - input[0])
    if (!outputDetermined && areAllFourValuesDistinct) {
        console.log("good");
        outputDetermined = true;
    }

    // If `outputDetermined` is still false after all checks, nothing is printed,
    // which matches the original code's behavior.
}

// This line remains unchanged to preserve the standard input/output mechanism.
processCharacterSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
