/* This file contains unit tests for the CData class,
 * demonstrating its basic functionality including construction,
 * data retrieval, and string conversion.
 * It relies on a custom test runner framework (implied by the 'test' object and 'assert' parameter).
 */

// Import necessary modules and initialize the test suite.
var CData = require( '../lib/xml' ).CData // The CData class from the XML library.
  , test = { }                             // An object to hold all test cases.
  ;                                        // Semicolon for variable declaration block.

// -----------------------------------------------------------------------------
// Test Case: CData Constructor Verification
// This test ensures that a CData object can be properly instantiated.
// -----------------------------------------------------------------------------
test[ 'CData (constructor)' ] = function ( beforeExit, assert ) {

  // Instantiate a new CData object with a simple string.
  var cdata = new CData( 'Hello!' )
    ; // End of variable declaration for this scope.

  // Assert that the created instance is an object type.
  assert.strictEqual( typeof cdata
                    , 'object'
                    )
  ;

  // Assert that the created instance is indeed an instance of the CData class.
  assert.strictEqual( cdata instanceof CData
                    , true
                    )
  ;
}
; // End of 'CData (constructor)' test case.


// -----------------------------------------------------------------------------
// Test Case: CData Data Retrieval
// This test verifies that the `getData()` method returns the correct content.
// -----------------------------------------------------------------------------
test[ 'CData (data)' ] = function ( beforeExit, assert ) {

  // Define the raw data string for the CData object.
  var DATA = 'Hello!'
    , cdata = new CData( DATA ) // Create a CData instance with the defined data.
    ; // Variable declaration block ends here.

  // Assert that calling getData() on the cdata object returns the original DATA.
  assert.strictEqual( cdata.getData( )
                    , DATA
                    )
  ;
}
; // End of 'CData (data)' test case.


// -----------------------------------------------------------------------------
// Test Case: CData toString Method
// This test checks the string representation of the CData object.
// -----------------------------------------------------------------------------
test[ 'CData (toString)' ] = function ( beforeExit, assert ) {

  // Define the data string and create a CData instance.
  var DATA = 'Hello!'
    , cdata = new CData( DATA )
    ; // Local variable declarations.

  // Assert that explicitly converting cdata to a string yields the original DATA.
  assert.strictEqual( String( cdata )
                    , DATA
                    )
  ;

  // Assert that implicitly converting cdata to a string (e.g., concatenation)
  // also yields the original DATA.
  assert.strictEqual( '' + cdata
                    , DATA
                    )
  ;
}
; // End of 'CData (toString)' test case.


// Export the 'test' object, making all defined test cases available
// to the test runner.
module.exports = test
; // Module export statement ends.