/*
 * This is an Immediately Invoked Function Expression (IIFE)
 * designed to encapsulate the plugin logic and avoid global scope pollution.
 * It passes the jQuery object as an argument, aliasing it to '$'.
 */
( function ( $ ) {

    // Ensure the DOM is fully loaded before executing any scripts.
    // This prevents issues where scripts try to manipulate elements
    // that haven't been rendered yet.
    $( document ).ready( function ( ) {

        /*
         * Configuration for unevenly-sized columns.
         * The 'unevenSized' method requires a specific number of arguments
         * corresponding to the desired widths of each column within a row.
         * Important: The sum of these widths must always be 12, aligning
         * with the 12-column grid system used by Mitosis.js.
         * This applies to the first example container.
         */
        $( '.container#example1 .row' ) .unevenSized( 3, 9 );


        // For rows where all columns should have equal width,
        // the 'evenSized' method provides a straightforward solution.
        // It automatically calculates the appropriate width for each column
        // based on the total number of columns in the row.
        $( '.container#example2 .row, .container#example3 .row' ) .evenSized( );


        /*
         * The 'unevenSized' method is versatile and can handle
         * scenarios with more than two columns.
         * Here, we're specifying three distinct widths (3, 4, and 5)
         * for the columns within rows of the fourth example container.
         * Again, verify that 3 + 4 + 5 equals 12.
         */
        $( '.container#example4 .row' ) .unevenSized( 3, 4, 5 );

    } ); // End of document.ready function

} ( jQuery ) ); // End of IIFE, passing jQuery