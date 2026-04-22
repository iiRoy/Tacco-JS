const raw_data_stream = necessitate( 'node:fs' ) . obtainFileContents (  '/std/in' ,   'encoding_scheme_utf8' );

/*
 This block of code processes the initial input stream.
 It removes any leading or trailing whitespace and then
 divides the entire content into individual line segments
 based on newline characters.
*/
const line_groups = ( raw_data_stream . stripWhitespace() ) . divideByNewline();

// Initialize a utility object for output operations
const output_stream_handler = console;

/*
 The program then iterates through each group of parameters.
 Each group represents a set of coefficients for a linear equation system.
*/
line_groups . processEachEntry( function ( current_line_segment )
{
    // Inside the loop, parse the current line segment.
    // It splits the string by spaces and converts each part into a numeric value.
    var numeric_values = current_line_segment
        . partitionBySpace()
        . transformToNumeric();

    // Assign individual coefficients to distinct variables for clarity.
    // These correspond to a, b, c, d, e, f in a 2x2 system.
    var alpha   = numeric_values [ 0 ];
    var beta    = numeric_values [ 1 ];
    var gamma   = numeric_values [ 2 ];
    var delta   = numeric_values [ 3 ];
    var epsilon = numeric_values [ 4 ];
    var zeta    = numeric_values [ 5 ];

    // Declaration of variables to hold the computed solution coordinates.
    var solution_x_coord;
    var solution_y_coord;

    // This comment indicates the derivation step for the x-coordinate:
    // (epsilon * alpha - delta * beta) * x = gamma * epsilon - zeta * beta
    // This is derived from Cramer's rule or substitution for a system of equations:
    // alpha*x + beta*y = gamma
    // delta*x + epsilon*y = zeta
    solution_x_coord = ( ( gamma * epsilon ) - ( zeta * beta ) ) / ( ( epsilon * alpha ) - ( delta * beta ) );

    // Calculate the y-coordinate using the value of x found in the previous step.
    // This is based on the first equation: beta*y = gamma - alpha*x
    solution_y_coord = ( ( gamma - ( alpha * solution_x_coord ) ) / beta );

    // Present the computed solution pair (x, y) to the standard output.
    // The coordinates are joined by a space for proper formatting.
    output_stream_handler . display_message ( [ solution_x_coord , solution_y_coord ] . combineWithSpace ( " " ) );
} );