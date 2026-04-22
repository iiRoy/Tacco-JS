/*
 * This is a Type I clone example of a YUI unit test file.
 * The original code is maintained exactly, with only whitespace
 * and comments altered to create a visually distinct but
 * functionally identical version.
 *
 * File: unit-test-clone.js
 * Purpose: Demonstrates Type I code cloning techniques.
 */

// Initialize the YUI module 'unit-test'
YUI.add (
    'unit-test' /* Module name */,
    function ( Y )
    {
        // Declare the test suite for Y.Unit functionality
        var suite = new Y.Test.Suite( 'Test Suite for Y.Unit' );

        // Add the first test case to the suite, focusing on toMarkup()
        suite.add
        (
            new Y.Test.Case(
                {
                    name: 'Testing toMarkup()', // Name of this specific test case

                    // Test method: Check if no className yields an empty yui3-u div
                    'No className should yield an empty yui3-u <div>' : function ()
                    {
                        var unit   = new Y.Unit(), // Create a new Unit instance
                            markup = '<div class="yui3-u ">\n</div>\n'; // Expected markup

                        // Assert that the generated markup matches the expected
                        Y.Assert.areEqual( markup , unit.toMarkup() );
                    },

                    // Blank line for visual separation
                    // Another blank line

                    /*
                     * Test method: Verify that a className is correctly applied
                     * within the yui3-u class.
                     */
                    'A className should follow the yui3-u' : function ()
                    {
                        // Initialize Unit with a specific className
                        var unit   = new Y.Unit( { className : 'left' } ),
                            markup = '<div class="yui3-u left">\n</div>\n'; // Expected output

                        // Compare the actual markup with the expected string
                        Y.Assert.areEqual( markup , unit.toMarkup() );
                    },


                    // This test ensures string content is directly nested.
                    'String content should be nested directly inside the unit' : function ()
                    {
                        var unit   = new Y.Unit(); // Default unit
                        var markup = '<div class="yui3-u ">\nHELLOSKI\n</div>\n'; // Markup with content

                        // Set the content for the unit
                        unit.set( 'content', ['HELLOSKI'] );

                        // Assert the generated markup is correct
                        Y.Assert.areEqual( markup , unit.toMarkup() );
                    },

                    // Test case for nesting Grid components within a Unit
                    'Grids should be able to nest inside a unit' : function ()
                    {
                        var unit   = new Y.Unit(); // New unit instance

                        // Define the expected markup for a nested grid
                        var markup = '<div class="yui3-u ">\n'
                                   + '<div class="yui3-g ">\n<div class="yui3-u ">\n</div>\n</div>\n'
                                   + '</div>\n';

                        // Set unit content to a new Grid object
                        unit.set( 'content' , [ new Y.Grid() ] );

                        // Verify the generated markup
                        Y.Assert.areEqual( markup , unit.toMarkup() );
                    },

                    // Test to check the order of mixed content (Grid and string)
                    'Grid and string content should be displayed in order' : function ()
                    {
                        var unit   = new Y.Unit(); // Instantiate Y.Unit

                        // Complex markup string for mixed content
                        var markup = '<div class="yui3-u ">\n'
                                   + '<div class="yui3-g ">\n<div class="yui3-u ">\n</div>\n</div>\n'
                                   + 'HELLOSKI\n'
                                   + '<div class="yui3-g ">\n<div class="yui3-u ">\n</div>\n</div>\n'
                                   + '</div>\n';

                        // Set content with a mix of Grid objects and strings
                        unit.set( 'content' , [ new Y.Grid() , 'HELLOSKI' , new Y.Grid() ] );

                        // Final assertion to confirm correct rendering
                        Y.Assert.areEqual( markup , unit.toMarkup() );
                    }
                }
            )
        );

        // Add the second test case, focusing on content validation within a Unit
        suite.add
        (
            new Y.Test.Case(
                {
                    name: 'Testing adding content to a Unit', // Test case name

                    // Test: Content should always be an array, not a simple string
                    'Content should not be something other than an array' : function ()
                    {
                        var unit = new Y.Unit( { content : 'foo' } ); // Attempt to set string content
                        // Assert that the content property does not hold the invalid string
                        Y.Assert.areNotEqual( 'foo' , unit.get( 'content' ) );
                    },

                    // Test: Content array should correctly store strings and Y.Grid objects
                    'Content should be an array of strings and Y.Grid objects' : function ()
                    {
                        var unit   = new Y.Unit(),                               // New unit instance
                            arrVal = [ 'a' , new Y.Grid() , 'c' ]; // Valid mixed content array

                        unit.set( 'content' , arrVal ); // Set the content
                        // Assert that the retrieved content matches the set array
                        Y.Assert.areEqual( arrVal , unit.get( 'content' ) );
                    },

                    // Test: Content array should not contain illegal object types (e.g., Date)
                    'Content array should not contain illegal objects' : function ()
                    {
                        var unit   = new Y.Unit(),                                // Unit for testing
                            arrVal = [ 'a' , new Date() , 'c' ]; // Array with an invalid object

                        unit.set( 'content' , arrVal ); // Attempt to set invalid content
                        // Assert that the content property does not hold the invalid array
                        Y.Assert.areNotEqual( 'foo' , unit.get( 'content' ) );
                    }
                }
            )
        );

        // Add the created test suite to the YUI Test Runner
        Y.Test.Runner.add( suite );
    } ,
    "1.0" /* Module version */ ,
    {
        requires: ['grid', 'test-console'] /* Dependencies for this module */
    }
);
// End of file.
// This concludes the Type I clone generation.