/*
 * This file contains test cases for the CSS parsing utility.
 * It uses chai for assertions and sinon for mocking (though not heavily used here).
 * The primary purpose is to test the 'parse.convert' function.
 */

var  chai  =  require('chai'); // Import the chai assertion library.
chai . should(); // Enable should-style assertions globally.

var sinon = require('sinon') ; // Import sinon for test spies, stubs, and mocks.
// Note: Sinon is imported but not actively used in this specific test block.


/*
 * Module dependencies and utility functions.
 * These are used for file system operations and path manipulation.
 */
var parse = require('../index.js'),
    fs    = require('fs'), // File system module for reading files.
    path  = require('path'), // Path module for resolving file paths.
    read  = fs.readFileSync, // Alias for fs.readFileSync for convenience.
    readdir = fs.readdirSync; // Alias for fs.readdirSync for convenience.


// Main test suite description.
describe(
  'parse.convert(str)',
  function()
  {
    // Iterate over all files in the 'test/cases' directory.
    readdir('test/cases').forEach(
      function(file)
      {
        // Skip files that end with '_t' (these are expected output files).
        // The '~' operator is used here as a shorthand for checking if indexOf returns -1.
        if (  ~file . indexOf('_t')  )
          return true;

        // Extract the base name of the file, removing the '.css' extension.
        file = path.basename(file, '.css');

        // Define an individual test case for each CSS file.
        it(
          'should parse ' + file + '.css',
          function()
          {
            // Read the input CSS file.
            var css = read(
              path.join('test', 'cases', file + '.css'),
              'utf8'
            );

            // Read the expected output (transformed) CSS file.
            var css_t = read(
              path.join('test', 'cases', file + '_t.css'),
              'utf8'
            );

            // Convert the input CSS using the parse utility.
            var ret = parse.convert(css);

            // Assert that the converted CSS matches the expected output.
            ret.should.equal(css_t);
          }
        ) ; // End of 'it' block.
      }
    ) ; // End of 'forEach' block.
  }
) ; // End of 'describe' block.