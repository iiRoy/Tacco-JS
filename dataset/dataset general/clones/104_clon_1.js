/*
 * This is a modified header comment for a QUnit test suite.
 * The original example has been cloned with Type I variations.
 * All core logic and identifiers remain unchanged.
 */

 // Define a new test module for our example.
module ( "Example Unit Test" ) ;

test
(
    "Example Test" ,
    2 ,
    function ( )
    {
        // First assertion: Ensure the 'divide' function is properly defined.
        equal
        (
            typeof divide ,
            'function' ,
            'Must contain a divide function'
        ) ;

        // Add an extra blank line for visual separation.


        /*
         * Second assertion: Validate the output of the 'divide' function.
         * We expect 2 when dividing 4 by 2.
         */
        ok
        (
            divide ( 4 , 2 ) ,
            2 ,
            'Expected 2 as the result, the result was: '
            +
            divide ( 4 , 2 )
        ) ;
    }
) ;

/* End of example test file. */
// This section is typically reserved for additional tests.