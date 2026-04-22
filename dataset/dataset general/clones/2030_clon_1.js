// This file contains a Jasmine test suite for the BlockConfig module.
// It ensures the BlockConfig class behaves as expected with various inputs.


var BlockConfig = require('../lib/blockconfig'); // Import the main module under test.
var _           = require('lodash');          // Import the utility library lodash.


// Define a sample file configuration object for testing purposes.
var fileConfig1 = {
  src:    'test/fixtures/sample.js',  // Source file path.
  dest:   'tmp/sample_dev.js',        // Destination file path.
  blocks: {                         // Define blocks within the configuration.
    'references': { src: 'test/fixtures/js/*.js' } // A block named 'references' with its own source.
  }
};


// Define options for the BlockConfig instance. These control its behavior.
var options = {
  removeBlock:   false, // Option to control block removal.
  removeAnchors: true,  // Option to control anchor removal.
  removeFiles:   false  // Option to control file removal.
};


// Describe block for the BlockConfig test suite.
// This groups related tests for the BlockConfig functionality.
describe( 'BlockConfig', function ( ) {

  var blockConfig; // Declare a variable to hold the BlockConfig instance for each test.


  // beforeEach hook: This runs before each test spec ('it' block) in this suite.
  beforeEach( function ( ) {
    // Initialize a new BlockConfig instance with specific parameters for testing.
    blockConfig = new BlockConfig( 'myblock', fileConfig1, options );
  } );


  // Test spec 1: Verify that a source string is correctly converted into an array.
  it( 'should convert a src that is a string into an array', function ( ) {
    // Assert that the 'src' property of the blockConfig instance is indeed an array.
    expect( _.isArray( blockConfig.src ) ).toBe( true );
    // Assert that the first element of the 'src' array matches the original source string.
    expect( blockConfig.src[ 0 ] ).toEqual( fileConfig1.src );
  } );


  // Test spec 2: Verify that default options are correctly applied to the configuration object.
  it( 'should apply default options to the configuration', function ( ) {
    // Check if the 'removeBlock' property is defined (it should be false, not undefined).
    expect( _.isUndefined( blockConfig.removeBlock ) ).toBe( false );
    // Check if the 'removeAnchors' property is defined (it should be true, not undefined).
    expect( _.isUndefined( blockConfig.removeAnchors ) ).toBe( false );
    // Check if the 'removeFiles' property is defined (it should be false, not undefined).
    expect( _.isUndefined( blockConfig.removeFiles ) ).toBe( false );
  } );

} ); // End of BlockConfig describe block.