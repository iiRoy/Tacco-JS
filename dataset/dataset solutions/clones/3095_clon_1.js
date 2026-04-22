/* This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly the same.
 * Only whitespace (indentation, spacing, blank lines) and comments
 * have been added, removed, or modified extensively.
 * The logical and structural identity of the code is preserved.
 */

// Enforce strict mode for better error handling and cleaner code.
"use strict"
;


/*
 * Defines the main class 'I' for parsing input.
 *
 * @param {string} s - The input string, typically multi-line.
 * @param {function} f - The parsing function to apply to each token, defaults to Number.
 */
function I(
    s, /* The source string to be parsed */
    f  /* The transformation function for parsed tokens */
)
{
    // Store the input string split into an array of lines.
    this._s = s.split("\n");

    // Initialize column index to 0.
    this._c = 0;

    // Initialize line index to 0.
    this._l = 0;

    // Set the parsing function, defaulting to 'Number' if not provided.
    this._f = f || Number
}


/*
 * Prototype method 'a' for class 'I'.
 * This method reads and returns the next single token from the input.
 */
I.prototype.a = function()
{
    // Retrieve the current line.
    var l = this._s[this._l];

    // If the line is undefined (end of input), return immediately.
    if ( !l )
    {
        return
    }

    // Trim whitespace from the line and split it into an array of tokens.
    var t = l.trim().split(" ");

    // Get the token at the current column index.
    var a = t[this._c];

    // Increment the column index.
    this._c++;

    // Check if we have processed all tokens on the current line.
    if ( t.length === this._c )
    {
        // Reset column index for the next line.
        this._c = 0;

        // Move to the next line.
        this._l++
    }

    // Apply the parsing function to the token and return the result.
    return this._f(a)
}
;


/*
 * Prototype method 'l' for class 'I'.
 * This method reads and returns all tokens from the current line as an array.
 */
I.prototype.l = function()
{
    // Retrieve the current line.
    var l = this._s[this._l];

    // If the line is undefined (end of input), return immediately.
    if ( !l )
    {
        return
    }

    // Reset the column index as we're processing the entire line.
    this._c = 0;

    // Move to the next line after processing the current one.
    this._l++;

    // Split the line into tokens, apply the parsing function to each, and return the array.
    return l.split(" ").map(this._f)
}
;


// Export the 'I' class so it can be used as a module.
module.exports = I
;


/**
 * The main function that orchestrates the program's logic.
 *
 * @param {string} input - The raw input string read from stdin.
 */
function main(
    input /* Input data as a string */
)
{
    // Create a new instance of the 'I' parser, treating all tokens as strings.
    const o = new I(input, String)
    ;


    // Read the first token using the 'a' method.
    const b = o.a()
    ;


    // Log the corresponding DNA base complement to the console.
    console.log({
        // Mapping A to T
        A: "T",

        // Mapping C to G
        C: "G",

        // Mapping G to C
        G: "C",

        // Mapping T to A
        T: "A"
    }[b])
    ;

}


// Execute the main function with input read from standard input.
main(
    require("fs")
        .readFileSync(
            "/dev/stdin", // Path to standard input
            "utf8"        // Encoding for reading the file
        )
)
;