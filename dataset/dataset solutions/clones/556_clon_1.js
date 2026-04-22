/*
 * This JavaScript code processes a series of test cases from standard input.
 * Each test case involves reading 'N' rows of data for 'M' items,
 * accumulating sums for each item, and then outputting the item IDs
 * sorted based on their final accumulated sums.
 *
 * This is a Type I clone, meaning:
 * - All original identifiers, variable names, function names, operators,
 *   and expressions are preserved exactly as they were.
 * - Extensive modifications have been made only to whitespace (indentation,
 *   spacing, blank lines) and comments (addition, removal, or modification)
 *   to create a visually distinct but functionally identical version.
 */


var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Reads the entire input from standard input as a UTF-8 string.


var Arr = ( input . trim ( ) ) . split ( "\n" ) ; // Trims leading/trailing whitespace from the input and splits it into an array of lines.


while ( true ) { // This is the main loop that processes each test case.
                 // It continues indefinitely until a specific termination condition is met.


    var NM = Arr . shift ( ) ; // Extracts the first line of the current test case, which contains 'N' and 'M'.


    if ( NM == "0 0" ) { // Checks if the extracted line is the sentinel "0 0", indicating the end of input.
        break ; // If it is "0 0", the loop terminates.
    }


    var nm = NM . split ( " " ) . map ( Number ) ; // Splits the "N M" string by space and converts the resulting parts into numbers.


    var n = nm [ 0 ] ; // Assigns the first number (N) to the variable 'n'. 'N' represents the number of data rows to follow.
    var m = nm [ 1 ] ; // Assigns the second number (M) to the variable 'm'. 'M' represents the number of items or columns.


    var arr = [ ] ; // Initializes an empty array named 'arr'. This array will store objects for each item,
                    // containing their original ID ('x') and their accumulated sum ('sum').


    // This loop initializes the 'arr' with 'm' item objects.
    // Each item is given an ID (x) starting from 1 up to 'm', and an initial sum of 0.
    for ( var i = 0 ; i < m ; i ++ ) {
        arr . push ( { x : ( i + 1 ) , sum : 0 } ) ; // Adds a new item object to 'arr'.
    }


    // This loop processes 'n' subsequent data rows.
    // Each row contains 'm' numbers, corresponding to the values for each item in that row.
    for ( var i = 0 ; i < n ; i ++ ) {
        var data = ( Arr . shift ( ) ) . split ( " " ) . map ( Number ) ; // Extracts a data row, splits it by space, and converts parts to numbers.

        // Iterates over each item in the 'arr' and updates its accumulated sum.
        // The 'j'-th element in the 'data' array is added to the 'sum' of the 'j'-th item in 'arr'.
        arr . forEach ( function ( v , j ) {
            arr [ j ] . sum += data [ j ] ; // Accumulates the data value to the item's sum.
        } ) ;
    }


    // Sorts the 'arr' based on the 'sum' property of each item object.
    // The sorting logic here results in a descending order of sums (highest sum first).
    arr . sort ( function ( a , b ) {
        a = a . sum ; // Extracts the sum of item 'a'.
        b = b . sum ; // Extracts the sum of item 'b'.
        if ( a < b ) { // If 'a's sum is less than 'b's sum,
            return true ; // ...return true, which means 'b' should come before 'a' in the sorted array.
        }
        else { // Otherwise (if 'a's sum is greater than or equal to 'b's sum),
            return false ; // ...return false, meaning 'a' should come before 'b' or their relative order is unchanged.
        }
    } ) ;


    var c = [ ] ; // Initializes an empty array named 'c'. This array will store the sorted item IDs.


    // Iterates through the now sorted 'arr' and extracts just the 'x' (ID) property of each item.
    // These IDs are pushed into the 'c' array, maintaining the sorted order.
    arr . forEach ( function ( v ) {
        c . push ( v . x ) ; // Adds the item's ID to the 'c' array.
    } ) ;


    console . log ( c . join ( " " ) ) ; // Prints the elements of array 'c' (the sorted item IDs)
                                        // joined by a space, followed by a newline character.
}