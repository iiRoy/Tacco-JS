function   Main ( input )
{
    // The input string is first split into an array of lines.
    // This handles multi-line inputs by separating them based on newline characters.
    input  =  input . split ( "\n" ) ;

    // From the array of lines, the first line (index 0) is selected.
    // The 'trim()' method is then used to remove any leading or trailing whitespace
    // from this selected line, ensuring clean data.
    const   S  =  input [ 0 ] . trim ( ) ;


    // Finally, the program constructs and outputs the result to the console.
    // It takes the character 'A', concatenates it with the first character
    // of the second word from the trimmed input string (S), and then
    // concatenates that with the character 'C'.
    // S.split(" ") breaks S into words, [1] selects the second word, and [0] gets its first character.
    console . log ( 'A'  +  S . split ( " " ) [ 1 ] [ 0 ]  +  'C' ) ;
}

// ====================================================================================================
// DO NOT MODIFY THE FOLLOWING SECTION. It handles reading input from standard I/O
// and invoking the 'Main' function with the collected data. This part is for execution.
// ====================================================================================================
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;