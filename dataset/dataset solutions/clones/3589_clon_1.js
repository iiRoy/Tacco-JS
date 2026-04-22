/*
 * This JavaScript code defines a solution for a problem
 * involving finding the minimum travel distance.
 *
 * It adheres to strict mode for better error handling and cleaner code.
 *
 * The problem involves an array of points and finding the shortest path
 * to visit a contiguous subsegment of 'K' points, starting from the origin (0).
 */
'use strict'   ;


/*
 * The primary function that orchestrates the problem-solving logic.
 * It takes the raw input string, parses it, performs calculations,
 * and then prints the final result.
 *
 * @param {string} input - The entire input read from standard input,
 *                         typically containing multiple lines.
 */
const    main    =    (   input   )    =>    {


    // First, split the input string by newline characters
    // to get an array of individual lines.
    input    =    input.split(   '\n'   )    ;


    /*
     * The first line of input typically contains two space-separated integers: N and K.
     * N represents the total number of points available.
     * K represents the number of contiguous points that must be visited.
     */
    const    N    =    parseInt(   input[0].split(' ')[0]   )    ;
    const    K    =    parseInt(   input[0].split(' ')[1]   )    ;


    // The second line of input contains space-separated integers
    // which represent the coordinates of the points.
    // We parse these into an array of numbers.
    const    arr    =    input[1].split(' ').map(   v    =>    parseInt(v)   )    ;


    // Initialize 'dist' with a very large number.
    // This variable will hold the minimum distance found so far.
    // We assume distances are positive.
    let    dist    =    100000000000    ;


    /*
     * This loop iterates through all possible starting positions
     * for a contiguous subsegment of K points within the 'arr' array.
     * The loop runs from index 0 up to `arr.length - K`.
     * This ensures that `arr.slice(i, K + i)` always yields a segment of length K.
     */
    for    (    let    i    =    0    ;    i    <=    arr.length    -    K    ;    i++    )    {

        // Extract the current subsegment of K points.
        // `arr.slice(start, end)` extracts elements from `start` up to (but not including) `end`.
        let    points    =    arr.slice(   i   ,   K    +    i   )    ;


        /*
         * Calculate the total distance if the journey starts from the origin (0),
         * travels to the leftmost point of the current segment, and then
         * continues to the rightmost point of the same segment.
         *
         * The distance is: |leftmost_point| + |leftmost_point - rightmost_point|.
         */
        let    sleft    =    Math.abs(   points[0]   )    +    Math.abs(   points[0]    -    points[points.length    -    1]   )    ;


        // If the calculated distance for starting from the left is smaller
        // than the current minimum distance, update 'dist'.
        if    (    dist    >    sleft    )
        {
            dist    =    sleft    ;
        }


        /*
         * Calculate the total distance if the journey starts from the origin (0),
         * travels to the rightmost point of the current segment, and then
         * continues to the leftmost point of the same segment.
         *
         * The distance is: |rightmost_point| + |rightmost_point - leftmost_point|.
         */
        let    sright    =    Math.abs(   points[points.length    -    1]   )    +    Math.abs(   points[points.length    -    1]    -    points[0]   )    ;


        // If the calculated distance for starting from the right is smaller
        // than the current minimum distance, update 'dist'.
        if    (    dist    >    sright    )
        {
            dist    =    sright    ;
        }

    } // End of the loop iterating through all possible K-point segments.


    // After checking all possible segments and starting directions,
    // 'dist' will hold the absolute minimum distance.
    // This value is then printed to the standard output.
    console.log(   dist   )    ;

} // End of the 'main' function definition.


/*
 * This part of the script is responsible for reading the input
 * from the standard input stream (typically `/dev/stdin` in Linux-like environments)
 * and then passing that input to the 'main' function for processing.
 *
 * `require('fs').readFileSync` is used to synchronously read the file content.
 * The input is assumed to be UTF-8 encoded.
 */
main(   require('fs').readFileSync(   '/dev/stdin'   ,   'utf-8'   )   )    ;