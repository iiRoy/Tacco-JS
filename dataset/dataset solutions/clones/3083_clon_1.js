// This JavaScript code processes input data to determine a specific condition.
// It's designed to be a Type I code clone, meaning its functionality is
// identical to the original, with only cosmetic changes in whitespace and comments.

function   Main  (  input  )
{
    // The following line was commented out in the original,
    // indicating an alternative parsing approach.
    // input = input.split(' ').map(i => parseInt(i, 10));

    // Split the entire input string by newline characters.
    input   =   input.split (  "\n"  )   ;


    // Parse the first element of the split input as an integer for 'num'.
    var   num   =   parseInt (  input[0]  ,  10  )   ;

    // Assign the second element of the split input to the 'hat' variable.
    var   hat   =   input[1]    ;


    // Count the occurrences of the character 'R' in the 'hat' string.
    // This is done by splitting the string by 'R' and then counting the resulting segments minus one.
    var   redNum   =   hat.split (  'R'  ) . length   -   1   ;

    // Compare half of 'num' with 'redNum' and print 'Yes' or 'No' accordingly.
    console.log (  (  num   /   2  )   <   redNum   ?   'Yes'   :   'No'  )   ;

} // End of the Main function definition.


// This footer handles standard input/output operations.
// As per typical competitive programming guidelines, this part is usually untouched.
// It reads all data from standard input and passes it to the Main function.
Main (  require (  "fs"  ) . readFileSync (  "/dev/stdin"  ,  "utf8"  )  )   ;