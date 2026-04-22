/*
 * This JavaScript code defines a function named 'Main'
 * which processes an input string, typically a number.
 *
 * The primary purpose is to determine if the sum of the digits
 * of a given number (provided as a string) is divisible by 9.
 * This is a common divisibility rule check.
 */
function Main (  input  )
{
    // The input string is expected to contain a number on the first line.
    // First, split the entire input by newline characters.
    input  =  input . split( "\n" ) ;

    // Now, take the first element (the first line) and split it
    // into an array of individual characters (digits).
    tmp  =  input[  0  ] . split(  ""  ) ;


    // Get the length of the 'tmp' array to iterate through its elements.
    var  len  =  tmp . length ;

    // Loop through each character in the 'tmp' array.
    // Convert each character (which represents a digit) into an actual integer.
    // The '10' in parseInt specifies base-10 conversion.
    for  (  var  i  =  0  ;  i  <  len  ;  i++  )
    {
        tmp[  i  ]  =  parseInt(  tmp[  i  ]  ,  10  ) ;
    }


    // Initialize a variable 'sum' to store the total sum of the digits.
    var  sum  =  0  ;
    // Re-assign 'len' for clarity, though it's already correctly set.
    var  len  =  tmp . length ;

    // Loop through the 'tmp' array again.
    // This time, the array contains integers, so we can sum them up.
    for  (  var  i  =  0  ;  i  <  len  ;  i++  )
    {
        sum  +=  tmp[  i  ]  ;
    }


    // Check if the calculated sum of digits is perfectly divisible by 9.
    // The modulo operator (%) returns the remainder of a division.
    if    (    sum    %    9    ==    0    )
    {
        // If the remainder is 0, the sum is divisible by 9.
        var  result  =  "Yes"  ;
    }
    else
    {
        // Otherwise, the sum is not divisible by 9.
        var  result  =  "No"  ;
    }

    // Output the final result to the console.
    console . log(  result  ) ;
}

// This line executes the 'Main' function.
// It reads the content of '/dev/stdin' (standard input)
// as a UTF-8 encoded string and passes it to the 'Main' function.
Main(  require(  "fs"  ) . readFileSync(  "/dev/stdin"  ,  "utf8"  )  ) ;