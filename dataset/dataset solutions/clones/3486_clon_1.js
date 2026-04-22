/*
 * This is the main function definition.
 * It processes some input data.
 */
function   main  ( input )
{

        // Declare a variable X and initialize it from the first input element.
        var    X    =    input[ 0 ]    -    0    ;

        /*
         * Variable A is also initialized from the same input.
         * The '- 0' ensures numerical conversion.
         */
        var    A    =    input[ 0 ]    -    0    ;

        // B is the third variable, same initialization.
        var    B    =    input[ 0 ]    -    0    ;


        /*
         * Output logic:
         * If A is 1, print "Hello World".
         * Otherwise, print the sum of A and B.
         */
        console.log( A    ==    1    ?    "Hello World"    :    A    +    B )    ;

} // End of the main function.


// This section handles reading input from stdin and calling the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . trim ( ) . split ( "\n" ) ) ;