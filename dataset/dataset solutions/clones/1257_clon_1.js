// This JavaScript file reads input from standard input,
// then processes that input to print various rectangular patterns
// based on provided dimensions. It demonstrates basic file I/O,
// string manipulation, and loop structures.
//
// This is a Type I clone, meaning only whitespace and comments
// have been altered from the original source.
const      input     =     require (    'fs'    ) .    readFileSync (    '/dev/stdin'    ,     'UTF-8'    )    ;


// Define the primary function responsible for processing the input
// and generating the rectangle outputs.
// The function takes the raw input string as its sole argument.
const      printRectangle     =     input     =>     {

       // First, split the entire input string into an array of individual lines.
       // Each line is expected to contain two space-separated numbers: height and width.
       const      array     =     input .    split (    `\n`    )    ;


       // Iterate through each line (which represents a potential rectangle definition)
       // in the `array` obtained from the input.
       for     (     let     i     =     0    ;     i     <     array .    length    ;     i++     )     {

              // Extract the height (h) and width (w) from the current line.
              // The line is split by space, and each part is converted to a Number.
              const      [ h , w ]     =     array [ i ] .    split (    ' '    ) .    map (    Number    )    ;

              // Check for the termination condition: if both height and width are 0,
              // it signals the end of input, and the function should stop processing.
              if     (     h     ===     0     &&     w     ===     0     )     return     false    ;

              // If not the termination condition, proceed to construct and print the rectangle.
              // This line uses string repetition to efficiently create the rectangle.
              // Array(w + 1).join('#') creates a row of 'w' hash characters.
              // This row is then joined with a newline character, and that whole string
              // is repeated 'h' times to form the full rectangle.
              console .    log (     Array (    h     +     1    ) .    join (    Array (    w     +     1    ) .    join (    '#'    )     +     '\n'    )     )    ;
       }
}    ;


// Execute the main function, passing in the content read from standard input.
// This initiates the rectangle printing process.
printRectangle (    input    )    ;