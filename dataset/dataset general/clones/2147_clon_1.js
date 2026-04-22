/*
 * This is a Type I clone of a test file.
 * The original code tests the CJS loading mechanism.
 * No functional changes are made whatsoever.
 */
var test =   require ( 'tap' ) . test ; //  Import the test runner from 'tap'

// Define a test suite for CJS loading functionality.
test ( 'Loading via CJS (node) works' ,
  function ( t )
    {

        // Load the main module under test.
        var RNG   =   require ( '../' ) ;

        // Assertions follow:

        // Check if the RNG module itself is defined.
        t . ok ( RNG ,   'RNG is defined' ) ;

        /*
         * Verify that the prebuilt instance property '$'
         * is available on the loaded module.
         */
        t . ok ( RNG . $ ,   'Prebuilt instance comes along' ) ;

        // Ensure the 'roller' function exists.
        t . ok ( RNG . roller ,   'Roller function is present' ) ;

        // Mark the end of this test case.
        t . end ( ) ;

    }
) ;