function obtainInputLine() {
    // This function simulates reading a line from standard input.
    // In a real Node.js application, this would typically be implemented
    // using the 'readline' module or a synchronous library like 'readline-sync'.
    // For the purpose of this Type II clone, we assume its existence and behavior
    // to match Java's `BufferedReader.readLine()`, returning a string or null at EOF.
    // The actual implementation is omitted as it's external to the core algorithm.
    return null; // Returns null to simulate End-Of-File (EOF)
}

// Declare various variables used in the processing logic.
// These correspond to `int j,k,i,b,c,W,N,S;` in the original Java code.
let iterationCounterJ; // Corresponds to 'j'
let temporaryK;        // Corresponds to 'k' (unused in original logic)
let mainLoopIterator;  // Corresponds to 'i'
let unusedVarB;        // Corresponds to 'b' (unused in original logic)
let unusedVarC;        // Corresponds to 'c' (unused in original logic)
let widthVarW;         // Corresponds to 'W' (unused in original logic)
let inputNumberN;      // Corresponds to 'N' (used for parsed input)
let currentTotalSum;   // Corresponds to 'S'

// The main processing loop continues indefinitely until a break condition is met.
// This mirrors the `for(i=0;;i++)` structure.
for (mainLoopIterator = 0; ; mainLoopIterator++) {
    // Initialize the sum for the current test case.
    // This corresponds to `S=0;`.
    currentTotalSum = 0;

    // Read the first line of input for the current test case.
    // This corresponds to `String str1 =br.readLine();`.
    let firstInputString = obtainInputLine();

    // Check if the end of input has been reached.
    // Java's `readLine()` returns `null` at EOF.
    if (firstInputString === null || firstInputString === undefined) {
        break; // Exit the main loop if no more input.
    }

    // Parse the input string into an integer.
    // This corresponds to `int n=Integer.parseInt(str1);`.
    let parsedValueN = parseInt(firstInputString);

    // Check for the termination condition of the problem (input `0`).
    // This corresponds to `if(n==0) break;`.
    if (parsedValueN === 0) {
        break; // Exit the main loop if the input is 0.
    }

    // Inner loop to process subsequent lines based on `parsedValueN`.
    // This corresponds to `for(j=0;j<n/4;j++)`.
    for (iterationCounterJ = 0; iterationCounterJ < parsedValueN / 4; iterationCounterJ++) {
        // Read the next line of input for the inner processing.
        // This corresponds to `String str2 =br.readLine();`.
        let secondInputString = obtainInputLine();

        // Handle potential end of input within the inner loop.
        if (secondInputString === null || secondInputString === undefined) {
            break; // Exit inner loop if no more input.
        }

        // Parse the inner input string into an integer.
        // This corresponds to `int a =Integer.parseInt(str2);`.
        let parsedValueA = parseInt(secondInputString);

        // Add the parsed value to the current total sum.
        // This corresponds to `S=S+a;`.
        currentTotalSum = currentTotalSum + parsedValueA;
    }

    // Print the accumulated sum for the current test case.
    // This corresponds to `System.out.println(S);`.
    console.log(currentTotalSum);
}
