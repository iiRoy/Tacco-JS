var chai = require('chai')
  , expect = chai.expect // The assertion library's expectation function.
  , grunt = require('grunt')
  , findup = require('findup-sync') // Utility to find files by traversing up directories.
  , requirejs = require('requirejs') /* Main RequireJS library */
  , exec = require('child_process').exec; // For executing shell commands.

/* Configure RequireJS for the test environment. */
requirejs.config(
  {
    baseUrl    :    __dirname, /* Set the base URL for module loading. */
    nodeRequire: require      // Enable Node.js style require for modules.
  }
);

// Declare variables to hold compiled template references later.
var nodeRequirejsTmpl, requirejsTmpl, nodeTmpl, regularTmpl;

// Load the Gruntfile.js using findup-sync and pass the grunt object.
require( findup( 'Gruntfile.js' ) )( grunt );


// Starting a new test suite for 'dot-compile' functionality.
describe ( 'dot-compile', function(  ) {

    // This 'before' hook runs once before all tests in this suite.
    before( function( done ) {
        // Execute a Grunt task to compile templates with Node.js and RequireJS support.
        exec( 'grunt dot:nodeRequirejs', function( error, stdout, stderr ) {
            // Once compilation is done, load the generated template module.
            nodeRequirejsTmpl = requirejs( './output/tmpl' );
            done(  ); // Signal that the asynchronous setup is complete.
        } );
    } );

    // Test case: Verify compilation of a basic, regular template.
    it( 'should be able to compile regular templates', function(  ) {
        expect( nodeRequirejsTmpl.regular(  ) ).to.equal( '<div></div>' );
    } );

    // Test case: Check compilation of templates that use variables.
    it( 'should be able to compile templates with variables', function(  ) {
        expect( nodeRequirejsTmpl.variables( { 'var' : 'hello' } ) ).to.equal( '<div>hello</div>' );
    } );

    // Test case: Ensure templates with arrays are compiled correctly.
    it( 'should be able to compile templates with arrays', function(  ) {
        expect( nodeRequirejsTmpl.arrays( { array: [ '1', '2', '3' ] } ) ).to.equal( '<div>1</div><div>2</div><div>3</div>' );
    } );

    // Test case: Confirm templates with hash maps (objects) are handled.
    it( 'should be able to compile templates with hash maps', function(  ) {
        expect( nodeRequirejsTmpl.hashMap( { '1': '1', '2': '2', '3': '3' } ) ).to.equal( '<div>1</div><div>2</div><div>3</div>' );
    } );

    // Test case: Verify the presence of htmlencode functionality.
    it( 'should be able to compile an htmlencode functionality', function(  ) {
        expect( typeof String.prototype.encodeHTML === 'function' ).to.be.true; // Checks if the helper function exists.
    } );

    // Test case: Test partial template compilation.
    it( 'should be able to compile partials', function(  ) {
        expect( nodeRequirejsTmpl.partials(  ) ).to.have.string( 'partial1' );
        expect( nodeRequirejsTmpl.partials(  ) ).to.have.string( 'partial2' ); // Check for both partials.
    } );

    // Test case: Check for in-template custom variables.
    it( 'should be able to compile templates with in-template-custom-vars', function(  ) {
        expect( nodeRequirejsTmpl.partials(  ) ).to.have.string( '<div class="test1 test2 test-3"></div>' );
    } );

    // Test case: Assert that comments are removed during compilation.
    it( 'should be able to remove comments during compile', function(  ) {
        // Check for block comments.
        expect( /\/\*.*?\*\//gm.test( nodeRequirejsTmpl.comments.toString(  ) ) ).to.be.false;
        // Check for single-line comments.
        expect( /^\s*\/\/.*/g.test( nodeRequirejsTmpl.comments.toString(  ) ) ).to.be.false;
    } );

    // Test case: Ensure HTTP/FTP links are NOT removed as comments.
    it( 'should not remove http & ftp links', function(  ) {
        expect( /http:\/\//gm.test( nodeRequirejsTmpl.comments.toString(  ) ) ).to.be.true; // HTTP links should remain.
        expect( /ftp:\/\//gm.test( nodeRequirejsTmpl.comments.toString(  ) ) ).to.be.true;  // FTP links should remain.
    } );

    // Test case: Verify nested partials compilation.
    it( 'should be compile partials-in-partials', function(  ) {
        expect( nodeRequirejsTmpl.partials(  ) ).to.have.string( 'can-compile-partial-in-partials' );
    } );

} ); // End of 'dot-compile' describe block.


/*
 * This block tests RequireJS-only compilation scenarios.
 * It ensures that the output is suitable for RequireJS environments.
 */
describe( 'requirejs-only', function(  ) {
    // Setup hook for this test suite.
    before( function( done ) {
        // Run Grunt to compile templates specifically for RequireJS.
        exec( 'grunt dot:requirejs', function( error, stdout, stderr ) {
            // Read the generated output file.
            requirejsTmpl = grunt.file.read( 'test/output/tmpl.js' );
            done(  ); // Callback to indicate completion.
        } );
    } );

    // Test: The compiled output should not contain AMD define checks.
    it( 'should not have amddefine module', function(  ) {
        expect( /if\(typeof define/.test( requirejsTmpl.toString(  ) ) ).to.be.false;
    } );

    // Test: The compiled output *should* contain a 'define' call for RequireJS.
    it( 'should have a define', function(  ) {
        expect( /define\(/.test( requirejsTmpl.toString(  ) ) ).to.be.true;
    } );
} ); // Closing the 'requirejs-only' suite.


// Test suite for Node.js-specific template compilation.
describe( 'node-only', function(  ) {
    // This 'before' hook prepares the environment for Node.js tests.
    before( function( done ) {
        // Execute the Grunt task for Node.js template compilation.
        exec( 'grunt dot:node', function( error, stdout, stderr ) {
            nodeTmpl = grunt.file.read( 'test/output/tmpl.js' ); // Store the compiled template content.
            done(  ); // Mark the asynchronous setup as complete.
        } );
    } );

    // Test: Ensure the compiled Node.js template does not contain AMD define checks.
    it( 'should not have amddefine module', function(  ) {
        expect( /if\(typeof define/.test( nodeTmpl.toString(  ) ) ).to.be.false;
    } );

    // Test: The compiled Node.js template should export its module.
    it( 'should have a module exports', function(  ) {
        expect( /module\.exports/.test( nodeTmpl.toString(  ) ) ).to.be.true;
    } );
} ); // End of 'node-only' describe block.


// This final test suite focuses on regular (browser-global) template compilation.
describe( 'regular', function(  ) {
    // Setting up the environment for regular compilation tests.
    before( function( done ) {
        // Run the Grunt task to compile templates for a regular browser environment.
        exec( 'grunt dot:regular', function( error, stdout, stderr ) {
            // Read the content of the generated template file.
            regularTmpl = grunt.file.read( 'test/output/tmpl.js' );
            done(  ); // Signal completion of this asynchronous setup.
        } );
    } );

    // Test: Regular templates should not contain AMD define checks.
    it( 'should not have amddefine module', function(  ) {
        expect( /if\(typeof define/.test( regularTmpl.toString(  ) ) ).to.be.false;
    } );

    // Test: Regular templates should not use Node.js module exports.
    it( 'should not have a module exports', function(  ) {
        expect( /module\.exports/.test( regularTmpl.toString(  ) ) ).to.be.false;
    } );

    // Test: Regular templates are expected to be wrapped in an IIFE (Immediately Invoked Function Expression).
    it( 'should have an immediate function', function(  ) {
        expect( /\(function\(\)\{/.test( regularTmpl.toString(  ) ) ).to.be.true;
    } );

    // Test: Further check for the IIFE's closing structure and return statement.
    it( 'should have an immediate function', function(  ) {
        expect( /return tmpl;\}\)\(\)/.test( regularTmpl.toString(  ) ) ).to.be.true;
    } );
} ); // End of 'regular' describe block.