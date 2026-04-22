/*
 *  This JavaScript function, named 'Main', processes input data
 *  to determine if a sequence of numbers contains duplicates.
 */
function Main (  input  )
{
    // The input is expected as a single string, potentially containing multiple lines.
    // We split this string by newline characters to get an array of lines.
    input = input . split (  "\n"  )  ;

    // The first line of the input (index 0) is assigned to the 'num' variable.
    num   =   input[  0  ]  ;

    /*
     * The second line of input (index 1) is expected to contain
     * space-separated numbers. We split this line by spaces
     * to obtain an array of number-strings, which is stored in 'a'.
     */
    var   a   =   input[  1  ]  . split (  " "  )  ;

    // Sort the array 'a' numerically.
    // The custom comparison function converts string elements to integers (base 10)
    // before performing the subtraction, ensuring a correct numerical sort.
    a . sort (  function(  a , b  )
    {
        return  parseInt (  a , 10  )  -  parseInt (  b , 10  )  ;
    }  )  ;


    // Iterate through the sorted array to check for adjacent duplicate elements.
    // The loop runs from the first element up to the second-to-last element.
    for  (  var   n   =   0  ;   n   <   num  -  1  ;   n  ++  )
    {
        // If an element at index 'n' is strictly equal to the element
        // immediately following it (at index 'n+1'), a duplicate is found.
        if  (  a[  n  ]  ===  a[  n+1  ]  )
        {
            // Log "NO" to the console, indicating that duplicates exist.
            console . log (  "NO"  )  ;
            // Terminate the function immediately upon finding the first duplicate.
            return  ;
        }
    }

    // If the loop completes without executing the 'return' statement,
    // it means no duplicates were found in the array.
    // Therefore, log "YES" to the console.
    console . log (  "YES"  )  ;

} // End of the 'Main' function definition.