// This file processes input to determine the area of a rectangle.
// It applies a series of constraints to adjust the rectangle's boundaries.

'use strict' // Enforce strict mode for cleaner code.

/**
 * The main function that processes the input arguments.
 * @param {string} arg - The input string, typically from stdin.
 */
const main = arg => {
    // Trim leading/trailing whitespace and split the input into lines.
    const input = arg . trim ( ) . split ( "\n" ) ;

    // Parse W, H, and N from the first line of input.
    // W: initial width of the rectangle.
    let W = input [ 0 ] . split ( ' ' ) . map ( num => Number ( num ) ) [ 0 ]
    // H: initial height of the rectangle.
    let H = input [ 0 ] . split ( ' ' ) . map ( num => Number ( num ) ) [ 1 ]
    // N: number of constraint operations to apply.
    let N = input [ 0 ] . split ( ' ' ) . map ( num => Number ( num ) ) [ 2 ]

    // Extract X coordinates for each constraint from subsequent lines.
    let Xs = input . slice ( 1 , input . length ) . map ( el => Number ( el . split ( ' ' ) [ 0 ] ) )
    // Extract Y coordinates for each constraint from subsequent lines.
    let Ys = input . slice ( 1 , input . length ) . map ( el => Number ( el . split ( ' ' ) [ 1 ] ) )
    // Extract 'a' (type of constraint) for each constraint from subsequent lines.
    let As = input . slice ( 1 , input . length ) . map ( el => Number ( el . split ( ' ' ) [ 2 ] ) )

    // Initialize the corners of the rectangle.
    // The rectangle is defined by its four corners in clockwise order:
    // (0,0) - bottom-left
    // (0,H) - top-left
    // (W,H) - top-right
    // (W,0) - bottom-right
    let corners = [
        { x: 0 , y: 0 } , // Corner 0: Represents the minimum x and minimum y boundary (bottom-left after adjustments)
        { x: 0 , y: H } , // Corner 1: Represents the minimum x and maximum y boundary (top-left after adjustments)
        { x: W , y: H } , // Corner 2: Represents the maximum x and maximum y boundary (top-right after adjustments)
        { x: W , y: 0 }   // Corner 3: Represents the maximum x and minimum y boundary (bottom-right after adjustments)
    ]

    // Loop through each constraint (N operations).
    for ( let i = 0 ; i < As . length ; i ++ ) {
        // Get the current constraint type.
        let a = As [ i ]

        // Apply the constraint based on its type 'a'.
        switch ( a ) {
            case 1 : // Constraint type 1: x_i < x (cut from left)
                // Adjust the minimum x-coordinates.
                // The new minimum x must be greater than or equal to Xs[i].
                corners [ 0 ] . x = Xs [ i ] > corners [ 0 ] . x ? Xs [ i ] : corners [ 0 ] . x
                corners [ 1 ] . x = Xs [ i ] > corners [ 1 ] . x ? Xs [ i ] : corners [ 1 ] . x
                break // Exit switch after applying case 1.

            case 2 : // Constraint type 2: x_i > x (cut from right)
                // Adjust the maximum x-coordinates.
                // The new maximum x must be less than or equal to Xs[i].
                corners [ 2 ] . x = Xs [ i ] < corners [ 2 ] . x ? Xs [ i ] : corners [ 2 ] . x
                corners [ 3 ] . x = Xs [ i ] < corners [ 3 ] . x ? Xs [ i ] : corners [ 3 ] . x
                break // Exit switch after applying case 2.

            case 3 : // Constraint type 3: y_i < y (cut from bottom)
                // Adjust the minimum y-coordinates.
                // The new minimum y must be greater than or equal to Ys[i].
                corners [ 0 ] . y = Ys [ i ] > corners [ 0 ] . y ? Ys [ i ] : corners [ 0 ] . y
                corners [ 3 ] . y = Ys [ i ] > corners [ 3 ] . y ? Ys [ i ] : corners [ 3 ] . y
                break // Exit switch after applying case 3.

            case 4 : // Constraint type 4: y_i > y (cut from top)
                // Adjust the maximum y-coordinates.
                // The new maximum y must be less than or equal to Ys[i].
                corners [ 1 ] . y = Ys [ i ] < corners [ 1 ] . y ? Ys [ i ] : corners [ 1 ] . y
                corners [ 2 ] . y = Ys [ i ] < corners [ 2 ] . y ? Ys [ i ] : corners [ 2 ] . y
                break // Exit switch after applying case 4.
        }
    }

    // Calculate the final width and height of the remaining rectangle.
    // The width is the difference between the maximum x (corners[2].x) and minimum x (corners[0].x).
    const width = corners [ 2 ] . x - corners [ 0 ] . x
    // The height is the difference between the maximum y (corners[2].y) and minimum y (corners[1].y).
    const heigth = corners [ 2 ] . y - corners [ 0 ] . y

    // Calculate the area.
    const square = heigth * width

    // If the width or height is negative, it means the rectangle has been completely cut off,
    // or the boundaries have crossed, resulting in no valid area.
    if ( width < 0 || heigth < 0 ) {
        console . log ( 0 ) // Output 0 as the area.
        return // Exit the function.
    }

    // Output the calculated area. If the square is negative (shouldn't happen if width/height check is correct,
    // but as a safeguard), output 0. Otherwise, output the square.
    console . log ( square >= 0 ? square : 0 )
}

// Read input from stdin and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;