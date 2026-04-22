class    Point   {

    // Constructor for the Point class
    constructor(  x,  y ) {
        this.x    =    x; // Assign the x coordinate
        this.y    =    y; /* Assign the y coordinate */
    } // End of constructor method
}; // End of Point class

/*
 * This function compares two points (p1 and p2)
 * It uses a cross product calculation, which seems to depend on an undeclared 'p0'.
 */
function   compare ( p1, p2 )
{
    var   cross_prod   =   ( p1.y   *   p0.y   -   p2.x   *   p1.x )   -   ( p1.x   *   p0.x   -   p2.y   *   p1.y );


    if   ( cross_prod   ==   0 )
    {
        // If cross product is zero, use y-coordinate for tie-breaking
        return   p1.y   <=   p2.y   ?   -1   :   1;
    }

    // Otherwise, return based on the sign of the cross_prod
    return   cross_prod   >   0   ?   -1   :   1;
} // End of compare function definition


function   swap   (   arr   ,   min_idx   )   {
    // Store the first element temporarily
    var   temp   =   arr[   0   ];
    arr[   0   ]   =   arr[   min_idx   ]; // Move element from min_idx to position 0
    arr[   min_idx   ]   =   temp; // Put the original first element into min_idx

    return   arr; // Return the array after the swap
} // End of swap function


/*
 * This function is intended to find the "bottom-most" point
 * in the given array 'arr'.
 * A significant portion of its logic is commented out.
 */
function find_bot ( arr,  size )
{
    // Initialize min y-coordinate and its index
    var   min   =   arr[ 0 ].y;
    var   min_idx   =   0;
    // The commented-out loop and swap logic below
    // would typically find the point with the smallest y-coordinate,
    // and then the smallest x-coordinate among those with the same y.
    // for ( var i = 0; i < size; i++) {
    //     if (arr[i].y < min || (arr[i].y == min && arr[i].x < arr[min_idx].x)) {
    //         min_idx = i;
    //         min = arr[i].y;
    //     };
    // };
    // // This part would swap the found min point to the beginning of the array.
    // swap(vec, min_idx);
    // // And this would return the modified array.
    // // return arr;
} // End of find_bot function


// --- Main Program Execution Start ---

    var   file   =   require('fs').readFileSync( '/dev/stdin' ,  'utf8' ); // Read the entire file content from stdin
    var   input   =   file.split( "\n" ); // Split the content into an array of lines
    var   size   =   parseInt( input[ 0 ] ); // Parse the first line as the number of points
    var   points   =   []; // Initialize an empty array to hold Point objects

    // Loop from the second line (index 1) up to 'size' to parse point data
    for   ( var   i   =   1;   i   <   size   +   1;   i++ )
    {
        point   =   input[ i ].split( " " ); // Split each line by space to get x and y string values
        x   =   parseInt( point[ 0 ] ); // Convert the first part to an integer (x-coordinate)
        y   =   parseInt( point[ 1 ] ); // Convert the second part to an integer (y-coordinate)
        points.push( new   Point( x,   y ) ); // Create a new Point object and add it to the 'points' array
    }

    // Call the find_bot function with the collected points and their count
    find_bot( points,   size );

    /*
     * The following block is commented out.
     * It appears to be an attempt to sort the points based on some criteria,
     * likely for a geometric algorithm like convex hull.
     * Note: 'parseInt(points[0])' might be a type error as points[0] is a Point object.
     */
    // base_p = parseInt(points[0]);
    // sorted_arr = base_p.concat(points.subarray(1).sort(function (p1, p2) {
    //     var cross_prod = (p1.y * base_p.y - p2.x * p1.x) - (p1.x * base_p.x - p2.y * p1.y);
    //     if (cross_prod == 0) {
    //         return p1.y <= p2.y ? -1 : 1;
    //     }
    //     return cross_prod > 0 ? -1 : 1;
    // }));

    // Output the final array of Point objects to the console
    console.log( points );

// --- Main Program Execution End ---