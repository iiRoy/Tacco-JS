/*
 * This script processes mathematical expressions provided via standard input.
 * It reads a sequence of numbers and operators, then evaluates them.
 * The input is expected to be space-separated.
 */

var input = require('fs')
    .readFileSync('/dev/stdin', 'utf8') // Read the input from /dev/stdin
    .trim() // Remove leading/trailing whitespace
    .split(' ') // Split the string into an array by spaces
    .map(function (value) { // Process each value in the array
        // Check if the value can be parsed as an integer
        if ( ! isNaN(parseInt(value))) {
            return parseInt(value); // Convert to integer if valid
        } else {
            return value; // Otherwise, keep it as a string (operator)
        }
    });


/**
 * Determines if a calculation can be performed with the given operands and notation.
 *
 * @param   {any}       a           The first operand.
 * @param   {any}       b           The second operand.
 * @param   {any}       notation    The operator (e.g., '+', '-', '*').
 * @returns {boolean}   True if 'a' and 'b' are numbers and 'notation' is a string, false otherwise.
 */
function canCalc(a, b, notation) {
    // Both operands must be numbers, and the notation must be a string.
    if ( ( typeof a === 'number' ) && ( typeof b === 'number' ) && ( typeof notation === 'string' ) ) {
        return true; // All conditions met for a valid calculation
    }

    return false; // Calculation is not possible
}


/**
 * Performs a basic arithmetic calculation based on the given notation.
 *
 * @param   {number}    a           The first number.
 * @param   {number}    b           The second number.
 * @param   {string}    notation    The operator ('+', '-', or '*').
 * @returns {number}    The result of the calculation.
 */
function calc(a, b, notation) {
    switch (notation) { // Evaluate the operator
        case '+': // Addition
            return a + b;
        case '-': // Subtraction
            return a - b;
        case '*': // Multiplication
            return a * b;
        // No default case needed as per original logic, assumes valid notation if canCalc passed.
    }
}


/**
 * Recursively performs calculations on the input array until a single result remains.
 * This function processes the input in chunks of three (operand, operand, operator).
 *
 * @param   {Array<any>}    input   The array containing numbers and operators.
 */
function perform(input) {

    var len = input.length; // Get the current length of the input array

    // Base case: If only one element remains, it's the final result.
    if ( len === 1 ) {
        console.log( input[0] ); // Output the final result
        return; // Terminate recursion
    }

    var newInput = []; // Initialize an array to store results of current step or remaining elements

    // Loop through the input array, taking 3 elements at a time
    for ( var i = 0; i < len; i += 3 ) {

        var tmp = input.slice(i); // Create a temporary slice from the current index

        var a        = tmp.shift();       // Extract the first operand
        var b        = tmp.shift();       // Extract the second operand
        var notation = tmp.shift();       // Extract the operator

        // Check if the extracted elements form a calculable expression
        if ( canCalc(a, b, notation) ) {
            newInput.push( calc(a, b, notation) ); // Perform calculation and add result to newInput
        } else {
            // If not calculable, push elements back into newInput in reverse order,
            // ensuring 'undefined' values are not pushed (e.g., if input length was not multiple of 3).
            if ( typeof notation !== 'undefined' ) {
                newInput.push(notation);
            }

            if ( typeof b !== 'undefined' ) {
                newInput.push(b);
            }

            if ( typeof a !== 'undefined' ) {
                newInput.push(a);
            }
        }
    }

    // Recursively call perform with the new, reduced input array
    perform(newInput);
}


// Initiate the calculation process with the parsed input.
perform(input);