let initialValue = parseInt(require("fs").readFileSync("/dev/stdin", "utf8").trim()); // Read input from standard input and parse it as an integer
let resultAccumulator = 1; // Initialize a variable to store the factorial result

// Loop from 1 up to (but not including) the initial value
for (let counterVariable = 1; counterVariable < initialValue; counterVariable++) {
    resultAccumulator *= counterVariable; // Multiply the accumulator by the current counter variable
}

console.log(resultAccumulator); // Output the final calculated result to the console
