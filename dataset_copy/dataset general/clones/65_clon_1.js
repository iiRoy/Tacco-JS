/*
 * This is a Type I clone of the original JavaScript code.
 * All functional aspects, identifiers, and expressions are kept identical.
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered.
 * This version aims to appear visually distinct while maintaining exact logical equivalence.
 */


(

    function
    (
        $
        ,
        undefined // Explicitly passing undefined for robustness, though not strictly necessary in modern JS environments.
    )
    {

        // This block of code executes immediately.
        // It targets specific DOM elements using jQuery.

        $( 'div' )      // Selects all 'div' elements in the document.
            .not( '.inner-div' )    // Filters out any 'div' elements that also have the class 'inner-div'.
            .lionbars(
                false   // Calls the 'lionbars' plugin on the filtered set of elements, passing 'false' as an argument.
            )
        ;

    }

    (
        jQuery  // Passes the global jQuery object as the '$' argument to the anonymous function.
    )

)
; // The semicolon ensures proper termination of the IIFE, especially useful when concatenating files.