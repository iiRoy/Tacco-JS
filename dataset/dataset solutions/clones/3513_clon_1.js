/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence,
 * with only variations in whitespace and comments.
 *
 * All identifiers, operators, and expressions are preserved.
 *
 * Code generated on: [Current Date, e.g., October 26, 2023]
 */

function   Main  (   input   )
{
    // Declare and initialize the variable N by parsing the first line of input.
    var   N    =    parseInt (   input .   split ( "\n" ) [ 0 ]   )   ;


    // Split the second line of input into an array of strings.
    var   inputList    =    input .   split ( "\n" ) [ 1 ] .   split ( " " )   ;

    // Initialize an empty object to store counts of each number.
    var   outputList    =    { }   ;

    // Initialize an array to store unique numbers encountered.
    var   useList    =    [ ]   ;

    // Initialize an accumulator for the final output value.
    var   output    =    0   ;

    // Iterate through the inputList to populate outputList and useList.
    for   (   var   i    =    0   ;     i    <    inputList .   length   ;     i ++   )
    {
        // Check if the current number has been encountered before.
        if   (   outputList [ inputList [ i ] ]    ==    null   )
        {
            // If not, initialize its count to 1 and add it to the useList.
            outputList [ inputList [ i ] ]    =    1   ;
            useList .   push ( inputList [ i ] )   ;
        }
        else
        {
            // If yes, increment its count.
            outputList [ inputList [ i ] ] ++   ;
        }
    }


    // --- Decision logic based on the number of unique elements ---


    // Case 1: Only one unique element.
    if   (   useList .   length    ==    1   )
    {
        console .   log ( N / 2 )   ; // Output N divided by 2.
        return   ;
    }
    // Case 2: Exactly two unique elements.
    else   if   (   useList .   length    ==    2   )
    {
        // Sort useList based on the counts of elements in descending order.
        useList .   sort (   function (   a ,   b   )
        {
            return   outputList [ b ]    -    outputList [ a ]   ; // Sort by count (descending).
        }   )   ;

        // Check if the counts of the two unique elements are equal.
        if   (   outputList [ useList [ 0 ] ]    ==    outputList [ useList [ 1 ] ]   )
        {
            console .   log ( "0" )   ; // Output 0 if counts are equal.
        }
        else
        {
            // Output half the difference between the two counts.
            console .   log (   (   outputList [ useList [ 0 ] ]    -    outputList [ useList [ 1 ] ]   )    /    2   )   ;
        }
    }
    // Case 3: More than two unique elements.
    else
    {
        // Sort useList based on the counts of elements in descending order.
        useList .   sort (   function (   a ,   b   )
        {
            return   outputList [ b ]    -    outputList [ a ]   ; // Sort by count (descending).
        }   )   ;

        // Remove the top two elements (those with the highest counts).
        useList .   shift ( )   ;
        useList .   shift ( )   ;

        // Sum the counts of the remaining elements.
        for   (   var   i    =    0   ;     i    <    useList .   length   ;     i ++   )
        {
            output    +=    outputList [ useList [ i ] ]   ;
        }

        console .   log ( output )   ; // Output the accumulated sum.
    }
}


// Invoke the Main function with input read from standard input.
Main (   require ( "fs" ) .   readFileSync ( "/dev/stdin" ,   "utf8" )   )   ;