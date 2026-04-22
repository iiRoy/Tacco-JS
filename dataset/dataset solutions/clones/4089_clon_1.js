/*
 * This JavaScript file is designed to read input lines,
 * process the first line to extract numerical data,
 * and then determine a winner based on a simple arithmetic calculation.
 * It utilizes the Node.js 'readline' module for asynchronous input handling.
 */
var    reader   =    require ( 'readline' ) . createInterface   (
    {
        input    :   process . stdin   ,   // Standard input stream for reading data
        output   :   process . stdout      /* Standard output stream for writing results */
    }
) ;


// An array to store each line read from the input stream.
var  lines  =  [ ] ;

// Register an event listener that triggers every time a new line of input is received.
reader . on (  'line'  ,  ( line )   =>
{
    // Add the current line to our collection of lines.
    lines . push ( line ) ;
} ) ;


// Register an event listener that triggers once the input stream is closed.
reader.on ( 'close' ,   ( )   =>
{
    // Retrieve the very first line that was read.
    var  line = lines [ 0 ] ;

    // Split the first line into an array of elements using a space as the delimiter.
    var  elems = line . split (  ' '  ) ;

    // Extract the second element (index 1) and third element (index 2) as variables A and B.
    // Note: These are initially strings, but will be coerced to numbers during arithmetic operations.
    var  A  =  elems [ 1 ] ;
    var  B  =  elems [ 2 ] ;

    // Perform a calculation: C = B - A - 1.
    var  C  =  B  -  A  -  1 ;

    // Determine the winner based on the parity of C.
    if  (  C  %  2  ==  1  )  // If C is an odd number...
    {
        console . log (  'Alice'  ) ; // ...Alice wins.
    }
    else  if  (  C  %  2  ==  0  )  // If C is an even number...
    {
        console . log (  'Borys'  ) ; // ...Borys wins.
    }
} ) ;