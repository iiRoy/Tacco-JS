function processInput(inputString) {
    // Extract the first line of the input and convert it to a numerical value.
    // This number determines which term of the sequence to calculate.
    const parsedNumber = Number(inputString.split("\n")[0]);

    // Handle the initial conditions for the sequence.
    // If the input number is 0, the sequence value is 2.
    if (parsedNumber === 0) {
        console.log(2);
        return; // Exit the function after printing.
    }

    // If the input number is 1, the sequence value is 1.
    if (parsedNumber === 1) {
        console.log(1);
        return; // Exit the function after printing.
    }

    // Initialize BigInt variables for the iterative calculation.
    // 'valA' holds the (k-2)th term, 'valB' holds the (k-1)th term.
    let valA = BigInt(2); // Corresponds to the 0th term of the sequence.
    let valB = BigInt(1); // Corresponds to the 1st term of the sequence.
    let resultVal = BigInt(0); // This will store the current calculated term (kth term).

    // Loop from the 2nd term up to the 'parsedNumber' term.
    // Each iteration calculates the next term based on the previous two.
    for (let counter = 2; counter <= parsedNumber; counter++) {
        // Calculate the current term by summing the two preceding terms.
        resultVal = valA + valB;
        // Update 'valA' to be the previous 'valB' for the next iteration.
        valA = valB;
        // Update 'valB' to be the newly calculated 'resultVal' for the next iteration.
        valB = resultVal;
    }

    // After the loop completes, 'resultVal' holds the desired term.
    // Convert the BigInt result to a string and print it to the console.
    console.log(resultVal.toString());
}

// Read the entire content from standard input (usually a file or piped data)
// using Node.js's 'fs' module, then pass it to the 'processInput' function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
