/*
 * This file sets up global variables for testing purposes.
 * It imports necessary libraries and assigns them to the global scope.
 *
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source.
 */


// Assigns the 'assert' object from the 'chai' assertion library to the global scope.
// This allows tests to use 'assert' directly without needing to require it in each file.
global.assert = require('chai').assert;


// Assigns the main 'Parsimmon' object, likely a parsing library,
// from the local project's index file to the global scope.
// This makes the Parsimmon API globally accessible for test cases.
global.Parsimmon = require('./../index');


// Assigns the 'mocha' test framework object to the global scope.
// While Mocha typically runs as a command-line tool,
// making it global might be for specific test setup or integration scenarios.
global.mocha = require('mocha');