(function() {
    const fileSystemModule = require("fs");

    const getStandardInputContent = (inputPath) => {
        return fileSystemModule.readFileSync(inputPath, "utf8");
    };

    const standardInputFilePath = "/dev/stdin";
    const rawInputString = getStandardInputContent(standardInputFilePath);

    // The original `i--` implicitly converts the string to a number and trims whitespace.
    // We make this explicit for clarity and to ensure exact numeric conversion.
    let numericInputCounter = Number(rawInputString.trim());

    let accumulatedProduct = 1;
    let loopIterationValue = numericInputCounter;

    // A temporary variable to hold the value of `loopIterationValue`
    // before it is decremented, to correctly mimic the `i--` condition
    // in the original `for` loop.
    let conditionEvaluationSnapshot;

    // Replicate the `for (...; i--;)` loop structure with a `while` loop.
    // The `i--` in the condition means:
    // 1. The current value of `i` is used for the condition check.
    // 2. `i` is then decremented.
    // 3. The loop body uses the *decremented* value of `i`.
    while (true) {
        conditionEvaluationSnapshot = loopIterationValue; // Store value for condition check
        loopIterationValue--; // Decrement for next iteration and for use in body

        // If the value *before* decrementing was falsy (e.g., 0), exit the loop.
        if (!conditionEvaluationSnapshot) {
            break;
        }

        // Perform the multiplication using the *already decremented* value.
        accumulatedProduct *= loopIterationValue;
    }

    // The final value of `loopIterationValue` is what the original code logs.
    const finalOutputValue = loopIterationValue;

    console.log(finalOutputValue);
})();
