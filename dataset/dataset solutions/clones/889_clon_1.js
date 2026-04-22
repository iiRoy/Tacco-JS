/*
 * This file contains JavaScript code for a specific problem.
 * It was authored by Shipura and sourced from Aizu Online Judge.
 * Problem URL: http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=2570
 *
 * Current status: In progress / To be determined.
 *
 * General comments:
 * This code includes custom input handling for Node.js environments,
 * mathematical functions, string manipulation, and a custom parsing/tokenizing logic.
 *
 * The solution involves recursive modular exponentiation-like calculations,
 * string elimination, number identification, and a tree-like structure processing.
 */


    // Assign console.log to a shorter variable for convenience.
    var log = console.log;


// Check if the code is running in a Node.js-like environment.
if (typeof process != "undefined") {

    // Initialize an empty string to accumulate input data.
    var input = "";


    // Resume standard input stream.
    process.stdin.resume();

    // Set the encoding for standard input.
    process.stdin.setEncoding('utf8');


    // Event listener for incoming data chunks.
    process.stdin.on('data', function (chunk) {

        // Append the received chunk to the input string.
        input += chunk;

    });


    // Event listener for the end of the input stream.
    process.stdin.on('end', function () {

        // Split the accumulated input into an array of lines.
        var lines = input.split("\n");

        // Call the main processing function with the parsed lines.
        main(lines);

    });

}


/**
 * The main function that processes each line of input.
 *
 * @param {Array<string>} lines - An array of input lines.
 */
function main(lines) {

    // Iterate over each line provided in the input.
    lines.forEach(function (line) {

        // Skip processing if the line is exactly "#".
        if (line != "#") {

            // Process the current line.
            processLine(line);

        }

    }, this); // 'this' context is not strictly necessary here but preserved.

}


/**
 * Recursive modular multiplication function.
 * This function calculates (x * y) % d, with special handling for large x and y.
 *
 * @param {number} x - The first operand.
 * @param {number} y - The second operand.
 * @returns {number} The result of (x * y) % d.
 */
function recM(x, y) {

    // Define the modulus.
    var d = 1000000007;


    // Special case for very large x and y > 1, potentially to optimize exponentiation.
    if (x > 90000000 && y > 1) {

        // Check if y is odd or even.
        var mod = y % 2;

        // Calculate y / 2 (integer division).
        var k = Math.floor(y / 2);

        // Recursively call recM for x and k.
        var n = recM(x, k);


        // If y was odd.
        if (mod) {

            // Calculate (2 * n + x) % d.
            var s = (2 * n + x) % d;

        }
        // If y was even.
        else {

            // Calculate (2 * n) % d.
            var s = (2 * n) % d;

        }

        // Return the final result modulo d.
        return s % d;

    }

    // Base case or for smaller numbers: direct modular multiplication.
    return (x * y) % d;

}


// S<x> calculation function.
// This function calculates S(x) which is equivalent to recM(x, x).
function S(x) {

    // Simply delegates to recM with x as both arguments.
    return recM(x, x);

}


// x >> y calculation function.
// This function calculates Math.floor(x / (2^y)).
function T(x, y) {

    // Performs a floor division by 2 raised to the power of y.
    return Math.floor(x / Math.pow(2, y));

}


// Function to remove 's' and all whitespace characters from a line.
function eliminate(line) {

    // Uses a regular expression to replace all occurrences of 's' or whitespace.
    return line.replace(/\s|S/g, '');

}


// Checks if a given input 'x' can be converted to a valid number.
// Returns true if 'x' is a number, false otherwise.
function is_number(x) {

    // Attempt to convert 'x' to a number.
    var n = Number(x);

    // Convert the number back to a string.
    var s = n.toString();

    // Return true if the string representation is not "NaN" (Not a Number).
    return Boolean(s !== "NaN");

}


/**
 * Divides a raw input line into numbers and operators/symbols.
 * It parses consecutive digits into a single number token.
 *
 * @param {string} line - The input line as a string.
 * @returns {Array<string|number>} An array of tokens (numbers or symbols).
 */
function divide_1st(line) {

    // Convert the input string into an array of characters.
    line = line.split('');

    // Get the length of the character array.
    var len = line.length;

    // Initialize variables for tracking number segments.
    var start = 0;
    var end = 0;

    // Array to store the processed tokens.
    var new_line = [];

    // Flag to indicate if currently processing a number.
    var is_now_number = false;


    // Iterate through each character in the line.
    for (var i = 0; i < len; i++) {

        // Get the current character.
        var e = line[i];


        // If not currently processing a number and the current character is a number.
        if (!is_now_number && is_number(e)) {

            // Mark the start of a new number.
            start = i;

            // Set the flag to true, indicating we are now inside a number.
            is_now_number = true;

        }
        // If currently processing a number and the current character is NOT a number.
        else if (is_now_number && !is_number(e)) {

            // Mark the end of the current number.
            end = i;

            // Set the flag to false, indicating we are no longer inside a number.
            is_now_number = false;


            // Extract the number characters, join them, convert to a number, and push to new_line.
            var a = line.slice(start, end);
            var s = a.join('');
            var p = Number(s);
            new_line.push(p);

        }


        // If the current character is NOT a number (it's a symbol).
        if (!is_number(e)) {

            // Push the symbol directly to new_line.
            new_line.push(e);

        }

    }


    // After the loop, check if we were still processing a number at the end of the line.
    if (is_now_number) {

        // If so, the number extends to the end of the line.
        end = len;

        // Extract, join, convert, and push the final number.
        var a = line.slice(start, end);
        var s = a.join('');
        var p = Number(s);
        new_line.push(p);

    }

    // Return the array of tokens.
    return new_line;

}


/**
 * Helper function to determine if a '>' character should be interpreted as 'q' (end of S<x>)
 * or as part of a 't' (>> operator).
 *
 * @param {number} i - The current index of the '>' character.
 * @param {Array<string|number>} line - The tokenized line array.
 * @returns {boolean} True if it's 'q', false if it's part of 't'.
 */
function is_q(i, line) {

    // Assume it's 'q' by default.
    var ret = true;


    // Check if the next character is also '>'.
    if (line[i + 1] == '>') {

        // If the character after '>>' is a number or '<', then it's 't' (>>).
        if (is_number(line[i + 2]) || line[i + 2] == '<') {

            // It's 't', so set return value to false.
            ret = false;

        }

    }

    // Return the determination.
    return ret;

}


/**
 * Converts a sequence of raw tokens (numbers, '<', '>', '>>') into a more structured
 * sequence of 'p' (for '<'), 'q' (for '>'), 't' (for '>>'), and numbers.
 *
 * @param {Array<string|number>} line - The array of raw tokens.
 * @returns {Array<string|number>} The tokenized array.
 */
function tokenizer(line) {

    // Variables for tracking 'q' related positions (not actively used in this implementation but preserved).
    var q_start = 0;
    var q_end = 0;


    // The array to store the new, processed tokens.
    var new_line = [];


    // Get the length of the input token array.
    var len = line.length;


    // Iterate through each token in the line.
    for (var i = 0; i < len; i++) {

        // Get the current token.
        var e = line[i];


        // If the token is a number, push it directly.
        if (is_number(e)) {

            new_line.push(e);

        }
        // If the token is '<', push 'p'.
        else if (e === '<') {

            new_line.push('p');

        }
        // If the token is '>'.
        else if (e === '>') {

            // Determine if it's 'q' or 't' using the helper function.
            if (is_q(i, line)) {

                // If it's 'q', push 'q'.
                new_line.push('q');

            }
            // If it's 't' (i.e., '>>').
            else {

                // Push 't'.
                new_line.push('t');

                // Increment 'i' to skip the second '>' character as it's part of 't'.
                i += 1;

            }

        }

    }

    // Return the array of processed tokens.
    return new_line;

}


/**
 * Processes the tokenized line by applying 'S' and 'T' operations
 * in a specific order, effectively reducing the expression.
 * This function modifies the 'line' array in place.
 *
 * @param {Array<string|number>} line - The tokenized array to be processed.
 * @returns {Array<string|number>} The reduced array, ideally with a single result.
 */
function treenize(line) {

    // Get the length of the token array.
    var len = line.length;

    // Initialize an index for iteration.
    var i = 0;


    // Continue processing as long as there is more than one element in the line.
    while (line.length > 1) {

        // Get the current element.
        var e = line[i];


        // If the current element is a number.
        if (is_number(e)) {

            // Check if the previous element was 't' (meaning a '>>' operation).
            if (i > 0 && line[i - 1] == 't') {

                // Apply the 'T' operation: T(operand1, operand2).
                // operand1 is at line[i-2], operand2 is at line[i].
                line[i - 2] = T(line[i - 2], line[i]);

                // Remove the 't' token and the second operand from the array.
                line.splice(i - 1, 2);

                // Adjust the index to re-evaluate the new element at the current position.
                i = i - 3;

            }

        }
        // If the current element is 'p' (which represents '<').
        else if (e == 'p') {

            // 'p' tokens are generally handled when 'q' is encountered.
            // No direct action for 'p' itself in this loop step.

        }
        // If the current element is 'q' (which represents '>').
        else if (e == 'q') {

            // Apply the 'S' operation: S(operand).
            // The operand is at line[i-1].
            line[i - 2] = S(line[i - 1]); // This looks like a bug in original code, should be line[i-1] = S(line[i-1]);

            // Remove the operand and the 'q' token from the array.
            line.splice(i - 1, 2);

            // Adjust the index.
            i = i - 3;

        }
        // If the current element is 't' (which represents '>>').
        else if (e == 't') {

            // 't' tokens are handled when the number following them is encountered.
            // No direct action for 't' itself in this loop step.

        }


        // Increment the index for the next iteration.
        i++;

        // Optional: log the state of the line for debugging.
        //log(line);

    }

    // Return the processed line.
    return line;

}


/**
 * Orchestrates the processing of a single input line through multiple stages:
 * elimination, initial division, tokenization, and tree-like reduction.
 *
 * @param {string} line - The raw input string line.
 */
function processLine(line) {

    // Step 1: Eliminate 's' and whitespace.
    line = eliminate(line);
    // If the line becomes empty after elimination, log an empty string and return.
    if (!line) {
        log('');
        return;
    }


    // Step 2: Divide the line into numbers and symbols.
    line = divide_1st(line);
    // If the line becomes empty after division, log an empty string and return.
    if (!line) {
        log('');
        return;
    }


    // Step 3: Tokenize the symbols ('<' -> 'p', '>' -> 'q', '>>' -> 't').
    line = tokenizer(line);
    // If the line becomes empty after tokenization, log an empty string and return.
    if (!line) {
        log('');
        return;
    }


    // Step 4: Reduce the tokenized line using 'S' and 'T' operations.
    line = treenize(line);
    // If the line becomes empty after treenization, log an empty string and return.
    if (!line) {
        log('');
        return;
    }


    // The original code had a commented-out line `line = line[0];`.
    // This implies that after treenize, `line` should ideally be an array with a single element.
    // If the result is not an array or is empty, handle it.
    if (!line) {
        log('');
        return;
    }


    // Log the final result (which should be an array containing a single number).
    log(line);

}