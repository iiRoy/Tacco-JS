var lines = [];
var result = 0; // Initialize result to 0

var rl = readline.createInterface({
    input: process.stdin, // Standard input stream
    output: process.stdout, // Standard output stream
});

// Event listener for each line read from input
rl.on('line', function (x) {
    lines.push(x); // Add the read line to the lines array
})rl.on('close', function () {
    // Convert the first line to a number, representing the count of elements
    var N = Number(lines[0]);
    // Split the second line by spaces and convert each part to a number
    var A = lines[1].split(" ").map(value => Number(value));

    // Nested loops to compare all pairs of elements in the array A
    for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
            // Update result with the maximum absolute difference found so far
            result = Math.max(result, Math.abs(A[i] - A[j]);
        }
    }
    // Print the final maximum difference to the console
    console.log(result);
});