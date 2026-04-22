// This is a Type I clone of the original JavaScript code.
// It has been extensively modified in terms of whitespace and comments,
// but its logical and structural content remains absolutely identical.


function   main(  input  ) {
    // The main function processes the input string.

    var   input   =   input.split(  ' '  )    ; // Split the input string by spaces into an array.


    var   n     =   parseInt(  input[0]  ,  10  )   ; // Parse the first element as an integer 'n'.
    var   a     =   parseInt(  input[1]  ,  10  )   ; // Parse the second element as an integer 'a'.
    var   b     =   parseInt(  input[2]  ,  10  )   ; // Parse the third element as an integer 'b'.

    // Create an array of size 'n' to store numbers from 1 to n.
    var   array =   new   Array(  parseInt(  n  ,  10  )  )   ;

    var   sum           =   0   ; // Initialize a variable to hold the sum of digits.
    var   result_array  =   [  ]  ; // Initialize an array to store indices that meet the criteria.
    var   fin_sum       =   0   ; // Initialize the final sum variable.


    // Populate the 'array' with numbers from 1 to 'n'.
    for   (  var   i   =   0  ;   i   <   n  ;   i++  )    {
        array[  i  ]   =   i   +   1   ;
    }


    // Iterate through the 'array' to find numbers whose digit sums fall within [a, b].
    for   (  var   j   =   0  ;   j   <   n  ;   j++  )    {
        var   tmp   =   array[  j  ]   ; // Get the current number from the array.

        // Calculate the sum of digits for the current number 'tmp'.
        while   (  tmp   >   0  )    {
            sum   +=   tmp   %   10   ; // Add the last digit to 'sum'.
            tmp    =   Math.floor(  tmp   /   10  )    ; // Remove the last digit.
        }

        // Check if the calculated sum of digits is within the range [a, b].
        if   (  a   <=   sum   &&   sum   <=   b  )    {
            result_array.push(  j  )   ; // If it is, add the original index 'j' to 'result_array'.
        }

        sum   =   0   ; // Reset 'sum' for the next number.
    }


    // Calculate the final sum by adding the original numbers (from 'array')
    // corresponding to the indices stored in 'result_array'.
    for   (  var   k   =   0  ;   k   <   result_array.length  ;   k++  )    {
        fin_sum   +=   array[  result_array[  k  ]  ]   ;
    }

    // Output the final calculated sum.
    console.log(  fin_sum  )   ;

}


// Call the main function with input read from standard input.
main(  require(  'fs'  ) . readFileSync(  '/dev/stdin'  ,  'utf8'  )  )   ;