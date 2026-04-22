// This file contains utility functions for compiling Roole code and asserting its output.

var assert = require('assert'); // Core Node.js assertion module

// File system module for potential future use or debugging
var fs = require('fs');

/*
 * The main Roole compiler module.
 * Path '..' indicates the parent directory where the main module is expected to reside.
 */
var roole = require('..');

// This line integrates Mocha with Promises, allowing asynchronous tests to be written more cleanly.
require('mocha-as-promised')();


/**
 * Compiles an input string using the 'roole' compiler and asserts that the output matches a given CSS string.
 * This function returns a Promise, making it suitable for asynchronous testing frameworks.
 *
 * @param {string} input - The Roole source code string to be compiled.
 * @param {string} css   - The expected CSS output string after compilation.
 * @returns {Promise<void>} A promise that resolves if the compilation and assertion are successful,
 *                           or rejects if an error occurs or the assertion fails.
 */
exports.compileTo = function( input , css ) {

    return roole
        .compile( input )
        .then(
            function( output ) {

                // Assert that the compiled output exactly matches the expected CSS.
                assert.equal( output , css );

            }
        )
    ; // End of then() call and return statement

}; // End of exports.compileTo function definition