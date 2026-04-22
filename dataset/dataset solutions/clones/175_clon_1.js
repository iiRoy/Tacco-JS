/*
 * This JavaScript code implements a solution for a specific combinatorial puzzle.
 * It involves pre-generating a set of valid digit patterns and then
 * checking incoming input strings against these patterns.
 *
 * The program is structured into two main parts:
 * 1. The 'Puzzle' function, which pre-calculates and stores valid patterns.
 * 2. The main execution block, which reads input, processes it, and outputs results.
 */


// Declares the primary function responsible for pre-computing valid puzzle states.
function Puzzle ( )
{
    // Initializes an empty JavaScript object to serve as a hash map (or set).
    // This object will store unique, sorted string representations of valid digit combinations.
    var obj = { } ;

    // Defines a string containing comma-separated three-digit sequences.
    // These sequences represent ascending runs (e.g., 012, 123).
    var arrA = "012,123,234,345,456,567,678" .split ( "," ) ;

    // Defines another string of comma-separated three-digit sequences.
    // These sequences consist of repeated digits (e.g., 000, 111).
    var arrB = "000,111,222,333,444,555,666,777,888" .split ( "," ) ;

    // Concatenates the two arrays, arrA and arrB, into a single array.
    // This combined array holds all potential three-digit segments.
    var arrAB = arrA .concat ( arrB ) ;

    // Defines a string of comma-separated two-digit sequences.
    // These are also repeated digits (e.g., 00, 11).
    var arrC = "00,11,22,33,44,55,66,77,88" .split ( "," ) ;

    // Initiates a series of five deeply nested 'for' loops.
    // These loops iterate through all possible combinations of segments from arrAB and arrC.
    for ( var i = 0 ; i < 16 ; i ++ )
    {
        for ( var j = 0 ; j < 16 ; j ++ )
        {
            for ( var k = 0 ; k < 16 ; k ++ )
            {
                for ( var l = 0 ; l < 16 ; l ++ )
                {
                    for ( var m = 0 ; m < 9 ; m ++ )
                    {
                        // Constructs a long string by concatenating four segments from arrAB
                        // and one segment from arrC.
                        var str = arrAB [ i ] + arrAB [ j ] + arrAB [ k ] + arrAB [ l ] + arrC [ m ] ;

                        // Processes the constructed string:
                        // 1. 'split("")' breaks the string into an array of individual characters.
                        // 2. '.map(Number)' converts each character (digit) into a number.
                        // 3. '.sort(function(a,b){return a-b;})' sorts the numbers in ascending order.
                        // 4. '.join("")' joins the sorted numbers back into a single string.
                        str = str .split ( "" ) .map ( Number ) .sort ( function ( a , b )
                        {
                            return a - b ; // Defines the comparison for numeric sorting.
                        } ) .join ( "" ) ;

                        // Adds the unique, sorted string 'str' as a key to the 'obj' object.
                        // The value 'true' simply indicates its presence (acting as a set).
                        obj [ str ] = true ;
                    }
                }
            }
        }
    }

    // Returns the 'obj' object, which now contains all pre-calculated valid patterns.
    return obj ;
}


// Executes the 'Puzzle' function once at the start of the program.
// The result (the object of valid patterns) is stored in the global variable 'P'.
var P = Puzzle ( ) ;


// --- Main Program Execution Block ---

// Requires the 'fs' (file system) module to read input.
// Reads the entire content of '/dev/stdin' (standard input) as a UTF-8 string.
var input = require ( 'fs' ) .readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Processes the input string:
// 1. '.trim()' removes any leading or trailing whitespace.
// 2. '.split("\n")' splits the string into an array of lines based on newline characters.
var Arr = ( input .trim ( ) ) .split ( "\n" ) ;

// Enters an infinite loop to process each line of input sequentially.
while ( true )
{
    // Checks if the 'Arr' array (containing input lines) is empty.
    if ( Arr .length == 0 )
    {
        break ; // If empty, breaks out of the infinite loop, as all input has been processed.
    }

    // Retrieves the first line from the 'Arr' array and removes it from the array.
    var str = Arr .shift ( ) ;

    // Initializes an empty array to store the valid answers for the current input line.
    var ans = [ ] ;

    // Loops through possible additional digits, from 0 to 8.
    for ( var i = 0 ; i < 9 ; i ++ )
    {
        // Takes the current input string 'str', splits it into characters,
        // and converts each character to a number, forming a new array 'arr'.
        var arr = str .split ( "" ) .map ( Number ) ;

        // Creates a new array by mapping each value 'v' in 'arr' to 'v - 1'.
        // This effectively decrements all digits in the array.
        arr = arr .map ( function ( v )
        {
            return v - 1 ;
        } ) ;

        // Adds the current loop iteration variable 'i' to the 'arr' array.
        arr .push ( i ) ;

        // Sorts the 'arr' array numerically in ascending order.
        arr .sort ( function ( a , b )
        {
            return a - b ;
        } ) ;

        // Initializes a frequency counter array 'b' with nine zeros.
        // This array will store counts for digits 0 through 8.
        var b = [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ] ;

        // Iterates through each value 'v' in the sorted 'arr'.
        // Increments the counter in 'b' at the index corresponding to 'v'.
        arr .forEach ( function ( v )
        {
            b [ v ] ++ ;
        } ) ;

        // Finds the maximum frequency of any digit present in the 'b' array.
        var max = Math .max .apply ( null , b ) ;

        // Checks if the maximum frequency is 5 or greater.
        // This is a rule for invalidating certain combinations.
        if ( max >= 5 )
        {
            continue ; // If invalid, skips the rest of the current loop iteration.
        }

        // Checks if the sorted and joined 'arr' string exists as a key in the 'P' object.
        // 'P.hasOwnProperty' is used for robust key existence checking.
        if ( P .hasOwnProperty ( arr .join ( "" ) ) )
        {
            // If the pattern is found in 'P', it's a valid solution.
            // Adds 'i + 1' (the original digit before decrementing) to the 'ans' array.
            ans .push ( i + 1 ) ;
        }
    }

    // Prints the results for the current input line to the console.
    // If 'ans' is empty, it means no valid solutions were found, so "0" is printed.
    // Otherwise, the elements of 'ans' are joined by spaces and printed.
    console .log ( ( ans .length == 0 ) ? "0" : ans .join ( " " ) ) ;
}

// End of the program.