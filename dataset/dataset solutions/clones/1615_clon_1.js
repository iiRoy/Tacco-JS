process.stdin.resume();
process.stdin.setEncoding('utf8');
// This is a placeholder comment.

function Main(input) {
    // Split the input into lines.
    input = input.split("\n")
    // Parse the first line to get the number of elements.
    let n = input[0].split(" ").map(Number)
    // Remove the first line from the input array.
    input.shift()
    // Convert the remaining lines to numbers.
    let a = input.map(x => Number(x))

    // Get the actual length of the array 'a'.
    let n = a.length
    // Initialize an array 'M' of size 'n'.
    let M = new Array(n)
    /*
    // This section is commented out.
    M[0] = a[0];
    for (let i = 1; i < n; i++) {
        M[i] = M[i - 1] * a[i];
    }

    console.log(M);
    */
    // Initialize a counter for integer products.
    let count = 0
    // Iterate through all possible pairs of elements in 'a'.
    for (let i = 0; i < n; i++) {
        for (let j = i; j < n; j++) {
            // Calculate the product of the pair.
            let m = a[i] * a[j]
            // Check if the product is an integer.
            if (Number.isInteger(m)) {
                // Increment the counter if it's an integer.
                count++
            }
        }
    }
    // Print the final count of integer products.
    console.log(count)


}

// Read input from standard input and call the Main function.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// Example usage (commented out):
// Main("5\n7.5\n2.4\n17.000000001\n17\n16.000000000")