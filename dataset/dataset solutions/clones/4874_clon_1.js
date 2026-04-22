'use strict' /* This enables strict mode for better error handling */


const main  =   arg => { // The main function receives an argument
  
      // Process the input string: trim whitespace and split by newlines
    const input = arg . trim ( ) . split ( "\n" ) ;


    // Extract W, H, and N from the first line of input
    let W = input[0] . split(' ') . map ( num => Number(num) ) [0] // Width of the area

    let H = input[0] . split ( ' ' ) . map ( num => Number ( num ) ) [1] // Height of the area
      
    let N = input [0] . split ( ' ' ) . map ( num => Number ( num ) ) [2] // Number of operations to perform


    // Extract X coordinates from the subsequent lines
    let Xs = input . slice ( 1 , input.length ) . map ( el => Number ( el . split ( ' ' ) [0] ) ) 
    
    // Extract Y coordinates from the subsequent lines
    let Ys = input . slice ( 1 , input . length ) . map ( el => Number ( el . split ( ' ' ) [1] ) ) 

    // Extract operation types (A values) from the subsequent lines
    let As = input . slice ( 1 , input . length ) . map ( el => Number ( el . split ( ' ' ) [2] ) ) 


    // Initialize the corners of the painting area.
    // The initial area is a rectangle defined by (0,0) and (W,H).
    // The order of corners here is important for later calculations.
    let corners = [ 
        { x: 0 , y: 0 } ,    // Bottom-left corner
        { x: 0 , y: H } ,    // Top-left corner
        { x: W , y: H } ,    // Top-right corner
        { x: W , y: 0 }      // Bottom-right corner
    ]
 

    // Loop through each operation (based on A values)
    for ( let i = 0 ; i < As . length ; i ++ ) {

        let a = As[i] // Current operation type

        // Use a switch statement to handle different operation types
        switch ( a ) {

            case 1: // Operation type 1: x <= x_i (cut from the left)
                // Update the x-coordinate of the bottom-left and top-left corners
                // The new x must be greater than or equal to the current x.
                corners[0] . x = Xs[i] > corners[0] . x ? Xs[i] : corners[0] . x
                corners[1] . x = Xs[i] > corners[1] . x ? Xs[i] : corners[1] . x
                break // Exit the switch statement
            
            case 2: // Operation type 2: x >= x_i (cut from the right)
                // Update the x-coordinate of the top-right and bottom-right corners
                // The new x must be less than or equal to the current x.
                corners[2] . x = Xs[i] < corners[2] . x ? Xs[i] : corners[2] . x
                corners[3] . x = Xs[i] < corners[3] . x ? Xs[i] : corners[3] . x
                break // Exit the switch statement

            case 3: // Operation type 3: y <= y_i (cut from the bottom)
                // Update the y-coordinate of the bottom-left and bottom-right corners
                // The new y must be greater than or equal to the current y.
                corners[0] . y = Ys[i] > corners[0] . y ? Ys[i] : corners[0] . y
                corners[3] . y = Ys[i] > corners[3] . y ? Ys[i] : corners[3] . y
                break // Exit the switch statement

            case 4: // Operation type 4: y >= y_i (cut from the top)
                // Update the y-coordinate of the top-left and top-right corners
                // The new y must be less than or equal to the current y.
                corners[1] . y = Ys[i] < corners[1] . y ? Ys[i] : corners[1] . y
                corners[2] . y = Ys[i] < corners[2] . y ? Ys[i] : corners[2] . y
                break // Exit the switch statement
        }
    }

    // Calculate the area of the remaining rectangle.
    // The width is (corners[2].x - corners[0].x) or (corners[3].x - corners[1].x)
    // The height is (corners[1].y - corners[0].y) or (corners[2].y - corners[3].y)
    // We use corners[0].x for the min X and corners[2].x for the max X.
    // We use corners[0].y for the min Y and corners[1].y for the max Y.
    const square = ( corners[0].x - corners[2].x ) * ( corners[0].y - corners[1].y )
    
    // If the calculated area is negative (meaning the rectangle has collapsed or inverted),
    // it implies no remaining area, so output 0. Otherwise, output the calculated area.
    console . log ( square >= 0 ? square : 0 ) // Output the final area
}   

/*
 * The following line reads input from standard input (/dev/stdin)
 * using Node.js's 'fs' module and passes it to the main function.
 * This is typical for competitive programming environments.
 */
main ( require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;