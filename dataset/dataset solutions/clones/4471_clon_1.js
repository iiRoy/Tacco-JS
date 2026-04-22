// This function calculates the sum of the last 'k' elements
// from a sorted array, starting from index 'n'.
function    Calc(  sortedArray,   n  , k  )
{
    // Initialize the result accumulator
    var     result   =   0   ;

    // Loop from 'n' down to 'n - k + 1' (inclusive)
    for ( var   i   =   n  ;   i   >   n   -   k  ;   i--   )
    {
        // Add the current element to the total
        result   +=   sortedArray[i]   ;
    }

    // Return the final sum
    return    result   ;
}

// Helper function for numeric comparison, used by Array.prototype.sort
function   compareNumbers (   a  ,   b   )
{
    // Standard numerical comparison for sorting
    return   a   -   b   ;
}

// This function takes an array of string numbers,
// parses them to integers, and then sorts them numerically.
function   Sort (  array   )
{
    // First, map each string item to an integer
    // Then, sort the resulting array using the custom comparator
    return    array.map (  function (  item   ) {
            return   parseInt (  item  ,   10   )
        }   ) . sort (   compareNumbers   )   ;
}


// The main function to process the input and produce the output.
function   Main (  input   )
{
    // Split the entire input string into an array of lines
    input   =   input.split (  "\n"   )   ;

    // Parse the first line for array dimensions
    line1   =   input[0] . split (  " "   )   ;

    // Parse the second line which contains the actual numbers
    line2   =   input[1] . split (  " "   )   ;


    // Extract 'n' (length of array, or starting index for Calc)
    var   n   =   parseInt (  line1[1]  ,   10   )   ; /* This variable represents the length of the array, or rather the highest index */

    // Extract 'k' (number of elements to sum from the end)
    var   k   =   parseInt (  line1[2]  ,   10   )   ; /* This variable represents the count of important elements to sum */


    // Perform the calculation and print the result to the console.
    // It sorts 'line2', then calls 'Calc' with the sorted array, 'n', and 'k'.
    console.log (   Calc (   Sort (   line2   )  ,  n  ,  k   )   )   ;
}

// Read input from stdin and pass it to the Main function.
Main (   require (  "fs"   ) . readFileSync (  "/dev/stdin"  ,   "utf8"   )   )   ;