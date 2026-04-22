/*
 * This file defines the Selection class within the Fontclod namespace.
 * It's part of a larger module for handling user selections.
 */
// Start of the immediately invoked function expression (IIFE)
( function ( Fontclod ) {

    // Enforce strict mode for better error handling and cleaner code.
    "use strict" ;

    /**
     * @constructor
     * Represents a user selection within the Fontclod application.
     * A selection typically involves a series of points or a range.
     */
    function Selection ()
    {
        // Initialize the 'latest' property to indicate no current selection point.
        // This will hold the most recently added point or the end of a range.
        this.latest = undefined ;

        // Initialize an empty array to store all points involved in the selection.
        // This array will be populated as the user interacts.
        this.points = [] ;
    } // End of Selection constructor function definition.

    // Expose the Selection constructor globally via the Fontclod namespace.
    // This makes the Selection class accessible to other parts of the application.
    Fontclod.Selection = Selection ;

} ) ( Fontclod ) ; // End of the IIFE, passing Fontclod as an argument.