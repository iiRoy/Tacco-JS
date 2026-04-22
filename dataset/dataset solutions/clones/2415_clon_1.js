"use strict"; // Enable strict mode for cleaner code.


const   main    =   (   arg ) => {
    // Process the input argument by trimming whitespace and splitting into lines.
    arg     =   arg . trim ( ) . split ( "\n" );

    // Parse dimensions H, W, and K from the first line of input.
    const   H   =   parseInt ( arg [ 0 ] . split ( " " ) [ 0 ] );
    const   W   =   parseInt ( arg [ 0 ] . split ( " " ) [ 1 ] );
    const   K   =   parseInt ( arg [ 0 ] . split ( " " ) [ 2 ] );


    // Extract the grid 'a' from the input, converting each row into an array of characters.
    const   a   =   arg . slice ( 1 , H + 1 ) . map ( n => n . split ( "" ) );


    // Initialize the 'answer' grid with the specified height.
    let     answer  =   new Array ( H );


    // Fill each row of the 'answer' grid with 'W' zeros.
    for ( let    i   =   0 ; i   <   answer . length ; i ++ )
    {
        answer [ i ]    =   new Array ( W ) . fill ( 0 );
    }


    // Initialize coloring variables.
    let     color   =   1;  // Current color to be assigned.
    let     flag    =   false; // Flag to indicate if a '#' has been encountered in the current segment.


    // Iterate through the grid to assign colors.
    for  (   let     h   =   0   ;   h   <   H   ;   h ++    )
    {
        for (   let     w   =   0   ;   w   <   W   ;   w ++    )
        {
            // If a '#' is found and 'flag' is true, increment color and reset flag.
            if  (   a [ h ] [ w ]   ===   "#"   &&   flag    )
            {
                color ++ ;
                flag    =   false   ;
            }

            // If a '#' is found, set 'flag' to true for subsequent cells in the same segment.
            if  (   a [ h ] [ w ]   ===   "#" )
            {
                flag    =   true ;
            }

            // Assign the current color to the cell in the answer grid.
            answer [ h ] [ w ]  =   color   ;
        }
        // After processing a row, increment color and reset flag for the next row.
        color ++ ;
        flag    =   false   ;
    }


    // The following line is commented out, but kept for reference.
    // console.log(a.join("\n"))

    // Output the final colored grid, with rows joined by newlines.
    console . log ( answer . join ( "\n" ) );
};

// Read input from stdin and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;