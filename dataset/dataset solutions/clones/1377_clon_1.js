function    Main( input )    {   /* This is the primary function to process the given input string */


    var lines   =   input.split( "\n" ) ; // Split the entire input by newline characters to get an array of lines


    lines.forEach( function ( arr )    { // Iterate over each individual line received from the input stream

        // Check if the current line signifies the termination condition.
        // If the line is exactly "0 0", we should stop further processing.
        if ( arr   ==  "0 0" )
        {
            break   ; // Exit the forEach loop as per problem specification
        }


        /*
         * Parse the current line:
         * 1. Split the line by space.
         * 2. Convert each resulting part into a Number.
         * The result 'r' will be an array of two numbers.
         */
        var r   =   arr.split( " " ) . map( Number )    ;


        // Assign the parsed numbers to 'h' (height) and 'w' (width) variables
        h   =   r[ 0 ] ;    // The first number is assigned to 'h'
        w   =   r[ 1 ] ;    // The second number is assigned to 'w'


        // Generate and print the rectangular pattern to the console.
        // This involves three main parts: top border, middle section, and bottom border.
        console.log(
            Array( w + 1 ) . join( "#" )    // Generates the top border: 'w' number of '#' characters
            +   "\n"                        // Add a newline character after the top border
            +   Array( h - 1 ) . join(      // Generates the middle section: 'h-1' rows
                    "#"                     // Start of a middle row with a '#'
                    +   Array( w - 1 ) . join( "." ) // Inner part of a middle row: 'w-1' number of '.' characters
                    +   "#"                 // End of a middle row with a '#'
                    +   "\n"                // Add a newline character after each middle row
                )
            +   Array( w + 1 ) . join( "#" )    // Generates the bottom border: 'w' number of '#' characters
            +   "\n"                            // Add a final newline character after the bottom border
        ) ; // End of the console.log statement
    } ) ; // End of the forEach loop
} // End of the Main function definition


// Call the Main function, passing the content of standard input as an argument.
// This reads the entire file at once using Node.js 'fs' module.
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;