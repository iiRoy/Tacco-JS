// This module handles standard input processing for numerical calculations.
// The original problem context might involve competitive programming challenges.
// Reference: http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=0565
// Another related problem: http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=ITP1_9_A&lang=ja

// Ensure the standard input stream remains active for data reception.
process.stdin.resume();
// Configure the input stream to interpret received data as UTF-8 encoded text.
process.stdin.setEncoding('utf8');

// Attach an event listener to the 'data' event of the standard input stream.
// This function will be invoked whenever new data chunks are available.
process.stdin.on('data', function (incomingDataBuffer) {
    // Convert the incoming data buffer to a string representation.
    const rawInputString = incomingDataBuffer.toString();

    // Split the raw string into individual lines, handling both LF and CRLF line endings.
    // Filter out any empty strings that might result from multiple newlines or trailing newlines.
    const lineSegments = rawInputString.split(/\r?\n/).filter(segment => segment.trim() !== '');

    // Transform each non-empty segment into a numerical value.
    // Filter out any entries that are not valid numbers (NaN) or are explicitly zero.
    const processedNumbers = lineSegments
        .map(Number) // Convert each string segment to a number.
        .filter(val => !isNaN(val) && val !== 0); // Exclude non-numeric values and zero.

    // --- Input Validation (Type III addition) ---
    // Ensure we have sufficient numerical data to perform the required operations.
    const MIN_REQUIRED_VALUES = 5;
    if (processedNumbers.length < MIN_REQUIRED_VALUES) {
        console.error("Error: Insufficient data provided. Expected at least " + MIN_REQUIRED_VALUES + " numbers.");
        // In a real application, more robust error handling or exiting might be appropriate.
        return;
    }

    // --- Data Partitioning (Type III modification/renaming) ---
    // Extract the first three numeric values into the primary set.
    const primaryValueCollection = processedNumbers.slice(0, 3);
    // Extract the next two numeric values (from index 3 to 4) into the secondary set.
    const secondaryValueSubset = processedNumbers.slice(3, 5);

    // --- Minimum Value Determination (Type III modification/renaming) ---
    // Calculate the smallest value within the primary set using modern spread syntax.
    const smallestInPrimary = Math.min(...primaryValueCollection);
    // Calculate the smallest value within the secondary set using modern spread syntax.
    const smallestInSecondary = Math.min(...secondaryValueSubset);

    // --- Final Calculation (Type III modification/renaming) ---
    // Introduce a constant for clarity (Type III addition).
    const DEDUCTION_AMOUNT = 50;
    // Compute the ultimate result by summing the two minimums and subtracting a constant.
    const finalCalculatedOutcome = smallestInPrimary + smallestInSecondary - DEDUCTION_AMOUNT;

    // Output the computed result to the console, formatted with a descriptive message.
    console.log("The final computed value is: " + finalCalculatedOutcome);
});