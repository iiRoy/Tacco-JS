// This is the main entry point function that processes the given input.
// It calculates a specific sum based on the input number.
function Main(  input  )
{
    // First, convert the input string into an integer value.
    input  =  parseInt(  input  )  ;

    // Initialize a variable to accumulate the results from the checkZero function.
    var  result  =  0  ;

    // Begin a loop that continues as long as the 'input' value is greater than zero.
    while  (  input  >  0  )
    {
        // Call the helper function 'checkZero' with the current input value
        // and add its returned value to the 'result' accumulator.
        result  +=  checkZero(  input  )  ;

        // Decrement the 'input' value by 2 for the next iteration of the loop.
        input  =  input  -  2  ;
    }

    // After the loop finishes, print the final calculated 'result' to the console.
    console.log(  result  )  ;

} // End of the Main function definition.



// This helper function determines the number of trailing zeros in the string
// representation of a given numeric input.
function  checkZero(  multi  )
{
    // A boolean flag used to control the execution of the internal while loop.
    var  i  =  true  ;

    // Convert the numeric input 'multi' into its string representation.
    multi  =  multi.toString()  ;

    // Calculate the index of the last character in the string.
    var  index  =  multi.toString().length  -  1  ;

    // Initialize a counter to store the number of trailing zeros found.
    var  result  =  0  ;

    // Loop indefinitely until the flag 'i' is explicitly set to false.
    while  (  i  )
    {
        // Check if the character at the current 'index' in the string is '0'.
        if  (  multi[index]  ==  "0"  )
        {
            // If it's '0', decrement the index to check the next character to the left.
            index--  ;
            // Increment the count of trailing zeros.
            result++  ;
        }
        else
        {
            // If the character is not '0', it means we've reached the end of trailing zeros,
            // so set the flag to false to terminate the loop.
            i  =  false  ;
        }
    }
    // Return the total count of trailing zeros found.
    return  result  ;
} // End of the checkZero function.


// This is the main execution line. It reads content from standard input,
// converts it to a UTF-8 string, and then passes it to the Main function for processing.
Main(  require("fs").readFileSync("/dev/stdin",  "utf8")  )  ;