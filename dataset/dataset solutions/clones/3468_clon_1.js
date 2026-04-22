/*
    This is the primary function definition.
    It takes a single argument, 'input', which is expected to contain
    the data to be processed.
    */
    function        Main(  input  )
{
    // Check the length of the input string for specific conditions.
    if  (  input.length   ===   2    ||    input.length   ===   3  )
    {

        // Declare a variable to store the length of the input.
        var    length    =    input.length;

        // Process the input to create a reversed, lowercase version.
        var    reverse    =    input.toLowerCase  (  )  .split  (  ""  )  .reverse  (  )  .join  (  ""  )  ;


        // Output based on conditional logic:
        // If length is 2, print original input.
        // If length is 3, print reversed input.
        // Otherwise, print an empty string (though this branch is unreachable with current 'if' condition).
        console.log  (  length   ===   2   ?   input   :   length   ===   3   ?   reverse   :   ''  )  ;

    }

} // End of the Main function block.


// This section handles reading input from stdin and invoking the Main function.
// It's crucial for the execution environment and should typically remain as is.
Main  (  require  (  "fs"  )  .readFileSync  (  "/dev/stdin"  ,   "utf8"  )  )  ;