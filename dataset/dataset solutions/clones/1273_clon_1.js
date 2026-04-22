/*
 * This is the main application logic.
 * It processes the input to reverse a string of words.
 */
function main ( )
{

    // Declare a variable to hold the second line of input, split by spaces.
    var str = input [ 1 ] . split ( ' ' ) ;

    // Reverse the order of elements in the 'str' array.
    str . reverse ( ) ;

    // Join the reversed array elements back into a single string with spaces.
    var ary = str . join ( ' ' ) ;


    // Output the final reversed string to the console.
    console . log ( ary ) ;

} // End of main function


// Declare a global variable to accumulate incoming data.
var input = '' ;


// Ensure the standard input stream is open and ready to receive data.
process . stdin . resume ( ) ;

// Set the encoding for the incoming data to UTF-8.
process . stdin . setEncoding ( 'utf8' ) ;

// Attach an event listener for 'data' events on the standard input.
// This function is called whenever new data chunks arrive.
process . stdin . on ( 'data' , function ( chunk )
{
    // Append the received chunk of data to the 'input' variable.
    input += chunk ;
} ) ; // End of data event handler


// Attach an event listener for the 'end' event on the standard input.
// This function is called once all input has been received.
process . stdin . on ( 'end' , function ( )
{
    // Split the accumulated input string into an array of lines.
    // Each line is separated by a newline character.
    input = input . split ( '\n' ) ;

    // Call the main function to process the input.
    main ( ) ;

} ) ; // End of end event handler