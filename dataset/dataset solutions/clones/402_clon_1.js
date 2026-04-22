/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly the same as in the original.
 *
 * The only modifications made are to whitespace (indentation, spacing, blank lines)
 * and comments (added extensively).
 *
 * The purpose of this transformation is to demonstrate a Type I clone,
 * where the code's functionality is absolutely identical, but its
 * visual presentation is altered significantly.
 */

// Initialize an empty object 'x' to store various numerical mappings.
// This object will act as a lookup table for specific routes or values.
var x = {};


// Populate the 'x' object with key-value pairs.
// The keys represent routes (e.g., "1to2") and values are associated costs or distances.

// Section for routes starting from '1'
x [ "1to2" ] = 300;
x [ "1to3" ] = 500;
x [ "1to4" ] = 600;
x [ "1to5" ] = 700;
x [ "1to6" ] = 1350;
x [ "1to7" ] = 1650;


// Section for routes starting from '2'
x [ "2to1" ] = 6;
x [ "2to3" ] = 350;
x [ "2to4" ] = 450;
x [ "2to5" ] = 600;
x [ "2to6" ] = 1150;
x [ "2to7" ] = 1500;


// Section for routes starting from '3'
x [ "3to1" ] = 13;
x [ "3to2" ] = 7;
x [ "3to4" ] = 250;
x [ "3to5" ] = 400;
x [ "3to6" ] = 1000;
x [ "3to7" ] = 1350;


// Section for routes starting from '4'
x [ "4to1" ] = 18;
x [ "4to2" ] = 12;
x [ "4to3" ] = 5;
x [ "4to5" ] = 250;
x [ "4to6" ] = 850;
x [ "4to7" ] = 1300;


// Section for routes starting from '5'
x [ "5to1" ] = 23;
x [ "5to2" ] = 17;
x [ "5to3" ] = 10;
x [ "5to4" ] = 5;
x [ "5to6" ] = 600;
x [ "5to7" ] = 1150;


// Section for routes starting from '6'
x [ "6to1" ] = 43;
x [ "6to2" ] = 37;
x [ "6to3" ] = 30;
x [ "6to4" ] = 25;
x [ "6to5" ] = 20;
x [ "6to7" ] = 500;


// Section for routes starting from '7'
x [ "7to1" ] = 58;
x [ "7to2" ] = 52;
x [ "7to3" ] = 45;
x [ "7to4" ] = 40;
x [ "7to5" ] = 35;
x [ "7to6" ] = 15;


// Read the entire input from standard input as a UTF-8 string.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' );

// Process the input:
// 1. Remove any trailing newline characters.
// 2. Split the string into an array of lines.
var Arr = ( input . replace ( /\n$/ , "" ) ) . split ( "\n" );


// Begin the main processing loop.
// This loop continues indefinitely until a specific break condition is met.
while ( true ) {
    // Extract the first element from 'Arr', convert it to a number, and store in 's'.
    // The '-0' is a common JavaScript idiom for type coercion to number.
    var s = Arr . shift ( ) - 0;


    // Check if the extracted value 's' is 0.
    // If it is, this signifies the end of input or a termination condition, so break the loop.
    if ( s == 0 ) break;


    // Extract the next line, split it by spaces, and convert each part to a number.
    // This likely represents a time in hours and minutes (e.g., "HH MM").
    var hm1 = ( Arr . shift ( ) ) . split ( " " ) . map ( Number );


    // Extract another element from 'Arr' and convert it to a number, storing it in 'g'.
    var g = Arr . shift ( ) - 0;


    // Extract and process the next line similarly to 'hm1'.
    var hm2 = ( Arr . shift ( ) ) . split ( " " ) . map ( Number );


    // Convert the first time (hm1) into total minutes from midnight.
    // parseInt(..., 10) ensures base-10 parsing.
    var S = ( parseInt ( hm1 [ 0 ] , 10 ) * 60 ) + parseInt ( hm1 [ 1 ] , 10 );


    // Convert the second time (hm2) into total minutes from midnight.
    var G = ( parseInt ( hm2 [ 0 ] , 10 ) * 60 ) + parseInt ( hm2 [ 1 ] , 10 );


    // Initialize a counter variable.
    var cnt = 0;


    // Apply a conditional check based on the calculated times 'S' and 'G'.
    // If the condition is met, increment the counter 'cnt'.
    // The condition evaluates to true if S is less than or equal to 1050 AND G is less than or equal to 1170,
    // OR if S is greater than or equal to 1050 AND G is less than or equal to 1170.
    // This simplifies to: G <= 1170.
    if ( ( S <= 1050 && G <= 1170 ) || ( S >= 1050 && G <= 1170 ) ) cnt++;


    // Check another condition using the 'x' lookup table.
    // Construct a key "gto s" and retrieve its value from 'x'.
    // If this value is less than or equal to 40, increment 'cnt'.
    if ( x [ g + "to" + s ] <= 40 ) cnt++;


    // Retrieve the base 'money' value from the 'x' lookup table, using the "sto g" key.
    var money = x [ s + "to" + g ];


    // If the counter 'cnt' has reached 2 (meaning both conditions were met),
    // apply a special discount logic.
    if ( cnt == 2 ) {
        // Halve the 'money' value, rounding down to the nearest integer.
        money = Math . floor ( money / 2 );

        // Adjust 'money' upwards until it is a multiple of 50.
        // This loop ensures the final value is always divisible by 50.
        while ( money % 50 != 0 ) money++;
    }


    // Output the final calculated 'money' value to the console.
    console . log ( money );
}