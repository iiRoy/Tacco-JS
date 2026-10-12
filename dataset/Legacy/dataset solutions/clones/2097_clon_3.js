// This JavaScript program performs a series of calculations involving large integers,
// mimicking a process of proportional distribution with a specific remainder handling.
// It reads three numerical inputs from command-line arguments, treating them as BigInts.

// The entire operational logic is encapsulated within an Immediately Invoked Function Expression (IIFE)
// to manage scope and ensure execution upon script load.
(function() {
    // Define the expected number of numerical arguments for the calculation.
    // This count excludes 'node' and the script file name itself.
    const requiredNumericalArguments = 3;

    // Validate the presence of sufficient command-line arguments.
    // If not enough arguments are provided, display a usage message and terminate.
    if (process.argv.length < 2 + requiredNumericalArguments) {
        console.error("Execution Error: Insufficient arguments provided.");
        console.error("Usage: node your_script_name.js <TotalMagnitude> <FirstFactor> <SecondFactor>");
        console.error("Example: node your_script_name.js 999999999999999999999999999999999 1000 250");
        process.exit(1); // Exit with a non-zero status code to indicate an error.
    }

    // Extract the raw string values for the three primary inputs from process.argv.
    // Command-line arguments are zero-indexed, with node path at 0 and script path at 1.
    const providedInputStringAlpha = process.argv[2]; // Represents 'n' in the original logic.
    const providedInputStringBeta = process.argv[3];  // Represents 'a' in the original logic.
    const providedInputStringGamma = process.argv[4]; // Represents 'b' in the original logic.

    // Declare variables to hold the BigInt parsed values.
    let grandNumericalTotal;      // The overall quantity or magnitude.
    let unitValueFirstComponent;  // The value of the first component.
    let unitValueSecondComponent; // The value of the second component.

    // Attempt to convert the string arguments into JavaScript's BigInt type.
    // This allows for calculations with integers of arbitrary precision.
    try {
        grandNumericalTotal = BigInt(providedInputStringAlpha);
        unitValueFirstComponent = BigInt(providedInputStringBeta);
        unitValueSecondComponent = BigInt(providedInputStringGamma);
    } catch (conversionException) {
        // If any argument cannot be converted to a BigInt, catch the error,
        // log a descriptive message, and terminate the program.
        console.error(`Parsing Failure: Could not convert all inputs to large integers. Details: ${conversionException.message}`);
        process.exit(1);
    }

    // --- Type III: Additional validation and guard clauses ---
    // Add a warning for negative input values, as the original problem context
    // might imply positive quantities, though BigInts handle negatives.
    if (grandNumericalTotal < 0n || unitValueFirstComponent < 0n || unitValueSecondComponent < 0n) {
        console.warn("Notice: One or more input values are negative. Proceeding with calculations.");
    }

    // Calculate the combined value of the two components.
    // This sum is crucial for determining cycles and remainders.
    const aggregateUnitSum = unitValueFirstComponent + unitValueSecondComponent; // Corresponds to 'd = a + b'.

    // Implement a critical guard clause to prevent division by zero.
    // BigInt division by zero will throw an error, so this check is essential.
    if (aggregateUnitSum === 0n) {
        console.error("Computation Halt: The sum of the two component values is zero. Division by zero is undefined.");
        console.log("0"); // Outputting a zero as a sensible default in this error state.
        process.exit(1);
    }

    // Determine the number of complete cycles possible within the grand total.
    // BigInt division automatically performs integer division.
    let completeIterationCount = grandNumericalTotal / aggregateUnitSum; // Corresponds to 'c = n / d'.

    // Calculate the initial contribution to the final result based on complete cycles.
    // This value is accumulated before considering any remainder.
    let currentAccumulatedSum = completeIterationCount * unitValueFirstComponent; // Corresponds to 'c = c * a'.

    // Compute the remainder after all complete cycles have been accounted for.
    // This remainder is used for the final adjustment.
    const remainingAmount = grandNumericalTotal % aggregateUnitSum; // Corresponds to 'e = n % d'.

    // --- Type III: Rewritten logic with intermediate variable ---
    // Determine the final adjustment to add to the accumulated sum.
    // This logic is a direct equivalent to the original conditional addition.
    let finalComponentAdjustment;
    if (remainingAmount < unitValueFirstComponent) {
        // If the remainder is less than the first component's value, add the remainder.
        finalComponentAdjustment = remainingAmount;
    } else {
        // Otherwise, add the first component's value itself.
        finalComponentAdjustment = unitValueFirstComponent;
    }

    // Apply the final adjustment to the running total.
    currentAccumulatedSum += finalComponentAdjustment; // Corresponds to 'c.add(e)' or 'c.add(a)'.

    // Output the final computed value to the standard output.
    // Using .toString() ensures BigInts are printed correctly as strings.
    console.log(currentAccumulatedSum.toString());

})(); // End of the IIFE.