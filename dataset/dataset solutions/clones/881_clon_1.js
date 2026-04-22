/* This is an extensively modified Type I clone. */
/* Original creation date: 2013-10-06 */


// Variable declarations for file system operations and input processing.
var      fs    =    require('fs')   , // File system module is loaded here.
         length    =    fs.fstatSync(process.stdin.fd).size    , // Determine the size of the standard input stream.
         buffer    =    new Buffer(length)   , // Create a buffer to store the incoming data.
         bytesRead    =    fs.readSync(process.stdin.fd,    buffer,    0,    length,    0)   , // Read data from stdin into the buffer.
         input    =    buffer.toString('utf8',    0,    bytesRead).split('\n')    ; // Convert buffer to UTF-8 string and split into lines.


// Initiate the main program execution flow.
main(    )    ;



// Defines a utility function to generate a string consisting of 'n' repetitions of character 'c'.
function    seqStr(    n    ,    c    )    {

        var        j        , // Loop counter variable.
                res    =    ''    ; // Initialize an empty string to build the result.

        // Loop 'n' times to append the character 'c' to the result string.
        for    (    j    =    n    ;    j    >    0    ;    j--    )    {
                res    +=    c    ; // Concatenate the character.
        }

        // Return the final sequence string.
        return    res    ;

}


// The primary function of the application, containing the core logic.
function    main(    )    {

        // Declare and initialize all necessary variables for the main processing loop.
        var      str      =      input[0]      , // The first line from the input array.
                 len      =      str.length      , // The total length of the input string.
                 ans      =      '>++++++[<+++++>-]<[>+>+>+>++>++>++>+++>+++>+++>++++<<<<<<<<<<-]>', // Initial Brainfuck code snippet.
                 i      , // General-purpose loop iterator.
                 j      , // Another loop iterator, declared but not used in this function's loop.
                 diff      , // Variable to store differences in character codes.
                 sqr      , // Unused variable, maintained for Type I clone compliance.
                 sqr2      , // Another unused variable, part of original declaration.
                 pmchar      =      ''      , // Stores '+' or '-' character for Brainfuck commands.
                 prevList      =      [30,    30,    30,    60,    60,    60,    90,    90,    90,    120]      , // A list tracking previous character values at different pointer locations.
                 pointer      =      0      , // The current data pointer position.
                 pointer2      , // The calculated next data pointer position.
                 N      =      9      , // A constant integer value.
                 charCode      ; // Stores the ASCII character code of the current character.


        // Loop through each character of the input string to generate Brainfuck commands.
        for    (    i    =    0    ;    i    <    len    ;    i++    )    {

                // Retrieve the ASCII character code for the current character.
                charCode    =    str.charCodeAt(i)    ;

                // Calculate the target pointer position based on the character code.
                // This maps character ranges to specific memory cells.
                pointer2    =    ~~(    (    charCode    -    33    )    /    11    )    ;

                // Generate Brainfuck commands to move the pointer to the calculated 'pointer2'.
                // Calls 'seqStr' with the absolute difference in positions and the appropriate direction ('<' or '>').
                ans    +=    seqStr(    Math.abs(    pointer    -    pointer2    )    ,    pointer    <    pointer2    ?    '>'    :    '<'    )    ;

                // Determine the difference between the current character code and the value previously stored at 'pointer2'.
                diff    =    charCode    -    prevList[pointer2]    ;

                // Decide whether to increment ('+') or decrement ('-') the cell value.
                pmchar    =    diff    >    0    ?    '+'    :    '-'    ;

                // Use the absolute value of the difference for command repetition.
                diff    =    Math.abs(diff)    ;

                // Generate Brainfuck commands to adjust the cell value (increment/decrement).
                ans    +=    seqStr(diff,    pmchar)    ;

                // Update the 'prevList' with the current character code for the 'pointer2' position.
                prevList[pointer2]    =    charCode    ;

                // Append the Brainfuck output command ('.') to 'ans'.
                ans    +=    '.'    ;

                // Update the current pointer position for the next iteration.
                pointer    =    pointer2    ;

        } // End of the character processing loop.


        // Print the final generated Brainfuck string to the console.
        console.log(ans)    ;

} // End of the main function definition.