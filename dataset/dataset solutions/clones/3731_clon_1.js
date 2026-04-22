// This is a comment explaining that 'input' will contain all the input data.
function Main(  input  )   {

    // The input data is split by newline characters.
    // The first line will be input[0], the second input[1], and so on.

    input  =   input.split (  "\n"  )   ;

    var  k   =   input[0]   ; // k is initialized from the first line of input.

    var  ketasu  =  1  ; // ketasu stores the number of digits in the current number sequence.

    var  sss  =  1  ; // sss represents the starting digit for the current number.

    // This loop iterates 'k' times, generating and printing numbers.
    for  ( var   i  =  0 ;   i  <  k ;   i++   )   {

        var   n  =  ""  ; // n will store the string representation of the number to be printed.

        n  +=  sss  ; // Append the starting digit.

        // Check if ketasu is greater than 1.
        // If true, it means we need to append '9's to form the number.
        if  (   ketasu   >   1   )   {

            // Loop to append 'ketasu - 1' nines to the string 'n'.
            for  (   var   j  =  0 ;   j  <  ketasu  -  1 ;   j++   )   {
                n   +=   "9"   ;
            }
        }

        // Print the generated number string to the console.
        console.log  (  '%s' ,  n  )   ;

        sss++  ; // Increment sss for the next iteration.

        // If sss exceeds 9, reset it to 1 and increment ketasu.
        // This logic handles the progression from single-digit numbers to multi-digit numbers.
        if  (   sss   >   9   )   {
            sss  =  1  ;
            ketasu++  ;
        }

    } // End of the main generation loop.


} // End of the Main function definition.


/*
 * This section of the code is responsible for handling standard input/output.
 * It should not be modified, as per the original instructions.
 * It reads the entire content from /dev/stdin and passes it to the Main function.
 */
Main  (  require (  "fs"  ) .  readFileSync (  "/dev/stdin"  ,  "utf8"  )  )   ;