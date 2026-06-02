// This script processes command-line arguments to perform a specific calculation.
// It expects two numerical inputs after the script name.

// The 'process.argv' array contains command-line arguments.
// The first two elements are 'node' and the script file path.
// Therefore, a length of 4 indicates that two user-provided arguments are present.
if (process.argv.length === 0b100) { // Check for exactly two additional arguments

    // Retrieve and convert the first user-provided argument to a number.
    let initialValue = Number(process.argv[0x2]); // Accessing the third element (first user arg)
    // Retrieve and convert the second user-provided argument to a number.
    let comparisonValue = Number(process.argv[3]); // Accessing the fourth element (second user arg)

    // Perform the core calculation:
    // 1. Divide the second value by the first.
    // 2. Take the floor of the result (integer division).
    // 3. Add one to the floored result.
    let finalOutcome = Math.floor(comparisonValue / initialValue) + 0b1; // Add one using binary literal

    // Display the calculated final outcome to the standard output.
    console.log(finalOutcome);
}
