class    Point
{
    // Class definition for a 2D point object
    constructor ( x, y )
    {
        // Initialize the x-coordinate of the point
        this.x    =    x;
        // Initialize the y-coordinate of the point
        this.y    =    y;
    }   ;

}   ;

// This function compares two points, likely for sorting purposes
function compare ( p1 , p2 )
{
    // Calculate the cross product for orientation check
    var cross_prod = ( p1.y * p0.y - p2.x * p1.x ) - ( p1.x * p0.x - p2.y * p1.y ) ;

    // If the cross product is zero, points are collinear
    if ( cross_prod == 0 )
    {
        // Compare based on y-coordinate if collinear
        return p1.y <= p2.y ? -1 : 1 ;
    }
    // Otherwise, use the cross product to determine order
    return cross_prod > 0 ? -1 : 1 ;
}   ;


// Utility function to swap elements in an array
function swap ( arr , min_idx )
{
    // Store the first element temporarily
    var temp = arr [ 0 ] ;
    // Move the element at min_idx to the first position
    arr [ 0 ] = arr [ min_idx ] ;
    // Place the stored temporary element at min_idx
    arr [ min_idx ] = temp ;
    // Return the modified array
    return arr ;
}

// Function to find the bottom-most point and place it at the beginning of the array
function find_bot ( arr , size )
{
    // Locate the point with the minimum y-coordinate.
    // If multiple points have the same minimum y, choose the one with the minimum x.
    var min = arr [ 0 ] . y ;
    var min_idx = 0 ; // Index of the current minimum point

    for ( var i = 0 ; i < size ; i++ )
    {
        // Check if current point has a smaller y, or same y but smaller x
        if ( arr [ i ] . y < min || ( arr [ i ] . y == min && arr [ i ] . x < arr [ min_idx ] . x ) )
        {
            min_idx = i ; // Update index of minimum
            min = arr [ i ] . y ; // Update minimum y value
        }   ;
    }   ;
    // Perform the swap operation to bring the bottom-most point to the front
    return swap ( arr , min_idx ) ;
}   ;

/*
 * Main execution block:
 * Reads input, processes points, finds the base point, and sorts the remaining points.
 */
var file = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
var input = file . split ( "\n" ) ; // Split file content by newline to get individual lines

var size = parseInt ( input [ 0 ] ) ; // Parse the first line as the number of points

var points = [ ] ; // Initialize an empty array to store Point objects

// Loop through the input lines to create Point objects
for ( var i = 1 ; i < size + 1 ; i++ )
{
    // Split each line into x and y coordinates
    point = input [ i ] . split ( " " ) ;
    x = parseInt ( point [ 0 ] ) ; // Parse x-coordinate
    y = parseInt ( point [ 1 ] ) ; // Parse y-coordinate
    points . push ( new Point ( x , y ) ) ; // Create and add new Point to the array
}

// Find the bottom-most point and place it at the start of the 'points' array
points = find_bot ( points , size ) ;

// The first point in the array is now the base point
base_p = parseInt ( points [ 0 ] ) ;

// Sort the remaining points (excluding the base point) using a custom comparison function
sorted_arr = points . subarray ( 1 ) . sort ( function ( p1 , p2 )
{
    // The original commented out comparison logic for cross product.
    // var cross_prod = (p1.y * base_p.y - p2.x * p1.x) - (p1.x * base_p.x - p2.y * p1.y);
    // if (cross_prod == 0) {
    //     return p1.y <= p2.y ? -1 : 1;
    // }
    // return cross_prod > 0 ? -1 : 1;

    // Current simplified comparison based purely on y-coordinate difference
    return p1.y - p2.y ;
} ) ;
// Output the processed points array to the console
console . log ( points ) ;