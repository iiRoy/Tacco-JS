function ProcessTextStream(incomingBuffer)
{
    // The incoming raw buffer is first split into individual lines
    // based on the newline character.
    let lineSegments = incomingBuffer.split(  '\n'  );

    // After parsing, specific characters from different lines are extracted
    // and then printed to the standard output.
    console.log( '%s%s%s' ,
                 lineSegments[0][0],
                 lineSegments[1][1],
                 lineSegments[2][2]
               );
}

// The program initiates by reading data from the standard input.
// It uses the Node.js file system module to synchronously read the content
// and then passes it to our main processing function.
ProcessTextStream( require("fs") . readFileSync ('/dev/stdin', 'utf8') );