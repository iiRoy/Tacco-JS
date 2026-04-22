function PerformTextOperation ( textualInput )
{
    // This function takes raw text, processes it, and outputs a specific result.
    // It assumes the input is a multi-line string.

    // 1. Split the entire input into an array of individual lines based on newline characters.
    // 2. Discard the very first line of the array (e.g., a header or count).
    // 3. Sort the remaining lines alphabetically (lexicographically).
    // 4. Select the first item from the now sorted list of lines.
    // 5. Print this selected item to the standard output.

    console
        .log
        (
            textualInput
                .split  ( "\n" )
                .slice  (    1   )
                .sort   (  )
                [  0  ]
        )
    ;
}

// Obtain the necessary functionality for file system interactions.
const fileSystemHandler = require ( "fs" ) ;

// Read all content from the standard input stream.
// Ensure the content is interpreted as a UTF-8 encoded string.
const sourceMaterial = fileSystemHandler . readFileSync ( "/dev/stdin" , "utf8" ) ;

// Execute the primary text processing routine with the acquired source material.
PerformTextOperation ( sourceMaterial ) ;