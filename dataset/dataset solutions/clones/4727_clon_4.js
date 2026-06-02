function processInputData(rawData) {
    const contentLines = rawData.split("\n");
    // The first line (N) is typically the count of elements in the second line.
    // The original code uses it as a loop bound, but a functional approach
    // naturally processes all elements parsed from the second line,
    // making the explicit N variable redundant for this specific logic.
    const parsedNumbers = contentLines[1].split(" ").map(Number);
    
    // Count the occurrences of odd numbers using a functional filter and length property.
    // Diverges from the original's imperative loop and bitwise odd check.
    const oddElementCount = parsedNumbers.filter(val => val % 2 !== 0).length;
    
    // Determine the final outcome based on the parity of the odd count.
    // Diverges from the original's bitwise parity check.
    const finalResult = (oddElementCount % 2 !== 0) ? "NO" : "YES";
    
    console.log(finalResult);
}

// Execute the processing function with input from stdin.
// This part remains similar as it's an external contract (reading from stdin).
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
