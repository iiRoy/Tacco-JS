const fileSystemModule = require('fs') ;

// Acquire all raw text input from the standard input stream.
// The expected character encoding for this input is UTF-8.
let dataSourceText = fileSystemModule . readFileSync ( '/dev/stdin' , 'utf8' );

// Divide the complete text input into an array of distinct line segments.
let inputSegments = dataSourceText . split ( '\n' ) ;


// Initiate an indefinite processing cycle for drawing geometric shapes.
// This loop will execute continuously until a specific termination signal is encountered.
for ( ; ; )
{
    // Retrieve the initial line segment from the collection, then parse it by space delimiters.
    let dimensionsArray = inputSegments . shift ( ) . split ( ' ' ) ;

    // Convert the first component of the parsed array into a numerical value representing the shape's height.
    const rectHeight = Number ( dimensionsArray [ 0 ] ) ;
    // Convert the second component of the parsed array into a numerical value representing the shape's width.
    const rectWidth = Number ( dimensionsArray [ 1 ] ) ;

    // Evaluate the termination condition: if both derived dimensions sum to zero.
    if ( rectHeight + rectWidth === 0 )
    {
        // If the condition is met, exit this perpetual loop.
        break ;
    }

    // Traverse through each vertical position (row) to render the shape.
    for ( let rowCounter = 0 ; rowCounter < rectHeight ; rowCounter ++ )
    {
        // Traverse through each horizontal position (column) within the current row.
        for ( let colCounter = 0 ; colCounter < rectWidth ; colCounter ++ )
        {
            // Ascertain if the current grid cell is situated on the shape's boundary.
            // A boundary cell is defined as being in the outermost row or outermost column.
            if ( rowCounter === 0 || rowCounter === rectHeight - 1 ||
                 colCounter === 0 || colCounter === rectWidth - 1 )
            {
                // Output a hash symbol '#' for cells that form the border.
                process . stdout . write ( '#' ) ;
            }
            else
            {
                // Output a dot symbol '.' for cells located within the shape's interior.
                process . stdout . write ( '.' ) ;
            }
        }
        // After completing a full row, insert a newline character to advance to the subsequent line.
        console . log ( ) ;
    }
    // Append an additional blank line to visually differentiate consecutive shapes.
    console . log ( ) ;
}