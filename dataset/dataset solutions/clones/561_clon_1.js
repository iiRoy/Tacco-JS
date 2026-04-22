/*
 * This is the main program execution entry point.
 * It continuously reads input until a specific condition is met.
 */
function main() {
    // Infinite loop to process multiple test cases
    while (1) {
        // Read the first integer 'n' for the current test case.
        var n = scan();

        // If 'n' is 0, it signifies the end of input, so break the loop.
        if (n == 0) {
            break; // Exit the while loop
        }

        // Read the second integer 'k'.
        var k = scan();

        // Initialize an empty array 'a' to store 'n' elements.
        var a = [];

        // Populate array 'a' with 'n' scanned values.
        rep(n, function(i) {
            a[i] = scan(); // Assign the scanned value to the i-th position
        });

        // Initialize 's' (current sum) to 0.
        var s = 0;

        // Calculate the sum of the first 'k' elements.
        rep(k, function(i) {
            s += a[i]; // Add the i-th element to 's'
        });

        // Initialize 't' (maximum sum found so far) with the initial sum 's'.
        var t = s;

        // Slide the window: iterate (n - k) times.
        rep(n - k, function(i) {
            s -= a[i];         // Subtract the element leaving the window
            s += a[k + i];     // Add the new element entering the window
            t = Math.max(s, t); // Update 't' if the current sum 's' is greater
        });

        // Print the maximum sum 't' found for the current test case.
        print(t);
    }
}


/**
 * A utility function for repetition (looping).
 * It can be called in two forms:
 * 1. rep(count, callback) - loops from 0 to count-1
 * 2. rep(start, end, callback) - loops from start to end-1
 *
 * @param {number} a - Either the count or the start index.
 * @param {number|function} b - Either the callback or the end index.
 * @param {function} [c] - The callback function, if b is the end index.
 */
function rep(a, b, c) {
    // Check if the 'c' argument (callback) is null or undefined.
    // If it is, it means the function was called in the rep(count, callback) form.
    if (c == null) {
        // In this case, 'b' is the callback and 'a' is the count.
        c = b;     // Assign 'b' (callback) to 'c'.
        b = a;     // Assign 'a' (count) to 'b' (end index).
        a = 0;     // Set 'a' (start index) to 0.
    }

    // Loop from 'a' (start index) up to, but not including, 'b' (end index).
    for (var i = a; i < b; ++i) {
        // Execute the callback function 'c' with the current loop index 'i'.
        // If the callback returns 'false', break out of the loop.
        if (c(i) === false) {
            break; // Stop iteration
        }
    }
}


// Ensure standard input stream remains open.
process.stdin.resume();
// Set the encoding for standard input to UTF-8.
process.stdin.setEncoding('utf8');


// Global variable to accumulate all received input data.
var input = '';

// Global variable to keep track of the current position when scanning input.
var input_index = 0;


/**
 * Scans and returns the next token from the processed input.
 *
 * @param {string} [type] - Optional. If 'string', returns the token as a string.
 *                          Otherwise, attempts to convert it to a number.
 * @returns {string|number} The next token from the input.
 */
function scan(type) {
    // Check if the requested type is 'string'.
    if (type === 'string') {
        // Return the token at the current index and then increment the index.
        return input[input_index++];
    } else {
        // Default behavior: convert the token to a number using the unary plus operator.
        // Return the number and then increment the index.
        return +input[input_index++];
    }
}


/**
 * Prints a given value to the console, followed by a newline.
 * This function acts as a wrapper for console.log.
 *
 * @param {*} val - The value to be printed.
 */
function print(val) {
    console.log(val); // Output the value to standard output.
}


// Register an event listener for incoming data on the standard input stream.
process.stdin.on('data', function(chunk) {
    // Append each received chunk of data to the 'input' string.
    input += chunk;
});

// Register an event listener for the 'end' of the standard input stream.
process.stdin.on('end', function() {
    // When all input has been received, split the accumulated 'input' string
    // by one or more whitespace characters to form an array of tokens.
    input = input.split(/\s+/);

    // After processing the input into tokens, call the main function to start execution.
    main();
});