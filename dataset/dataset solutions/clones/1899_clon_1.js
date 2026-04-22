/*
 * This JavaScript code reads input from stdin, processes it,
 * and then prints a result to stdout.
 * It's designed to solve a problem related to finding "highest" points
 * based on a set of relationships and heights.
 */

// Utilize the 'fs' (file system) module to read input.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . split ( '\n' ) ;

// The first line of input contains two integers, N and M.
// N represents the total number of points, M represents the number of relationships.
var [ N , M ] = input [ 0 ] . split ( ' ' ) . map ( Number ) ;

// The second line of input contains N integers, representing the heights (H) of each point.
var H = input [ 1 ] . split ( ' ' ) . map ( Number ) ;

// Initialize an array `isHighest` of size N, where each element is initially true.
// This array will track whether a point is considered "highest" or not.
var isHighest = new Array ( N ) . fill ( true ) ;

// Loop through each of the M relationships provided in the input.
// These relationships start from the third line (index 2) of the input.
for ( var i = 0 ; i < M ; i ++ )
{
    // For each relationship, parse two integers A and B.
    // These represent the indices of two points that are connected.
    // We subtract 1 from A and B to convert them from 1-based indexing
    // (as typically found in competitive programming problems) to 0-based indexing
    // for JavaScript arrays.
    var [ A , B ] = input [ i + 2 ] . split ( ' ' ) . map ( v => Number ( v - 1 ) ) ;

    // Compare the heights of point A and point B.
    if ( H [ A ] < H [ B ] )
    {
        // If point B is taller than point A, then A cannot be the highest point.
        isHighest [ A ] = false ;
    }
    else if ( H [ B ] < H [ A ] )
    {
        // If point A is taller than point B, then B cannot be the highest point.
        isHighest [ B ] = false ;
    }
    else
    {
        // If both points A and B have the same height,
        // then neither of them can be considered the highest (in the context of this problem).
        isHighest [ A ] = isHighest [ B ] = false ;
    }
} // End of the loop iterating through relationships.

// After processing all relationships, count how many points are still marked as 'true' in `isHighest`.
// These are the points that have not been "outranked" by any connected point.
// The `filter(v => v)` method keeps only the true values, and `.length` gives their count.
console . log ( isHighest . filter ( v => v ) . length ) ;