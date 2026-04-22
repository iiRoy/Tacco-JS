/*
 * This file contains logic for a specific pattern matching problem.
 * It processes input from a file, constructs segments, and then
 * performs a 2D pattern search.
 */

// Initial configuration object for input and newline character.
// The commented line is for Windows, the active one for Linux.
// config = { input: 'tmp', newline: '\r\n' }; // Windows-style newline
config = { input: '/dev/stdin', newline: '\n' }; // Linux-style newline

// Require the 'assert' module for debugging and validation purposes.
const assert = require('assert');


// Read the entire input file, split it into lines, and store in 'line' array.
// 'ascii' encoding is used for raw character reading.
line = require('fs') . readFileSync ( config . input , 'ascii' )
  . split ( config . newline ) ;


// Process the first line of input to extract H (height) and W (width).
// It's assumed the first line contains two space-separated numbers.
line [ 0 ] = line [ 0 ] . split ( ' ' ) . map ( Number ) ;

H = line [ 0 ] [ 0 ] ; // Assign the first number to H.

W = line [ 0 ] [ 1 ] ; // Assign the second number to W.


// Extract the 'field' data from the input lines.
// 'field' represents the main grid to be searched.
field = line . slice ( 1 , 1 + H ) ;

// Process the line immediately following the 'field' data.
// This line contains R (pattern height) and C (pattern width).
line [ 1 + H ] = line [ 1 + H ] . split ( ' ' ) . map ( Number ) ;

R = line [ 1 + H ] [ 0 ] ; // Assign the first number to R.

C = line [ 1 + H ] [ 1 ] ; // Assign the second number to C.


// Extract the 'pat' (pattern) data from the input lines.
// The pattern starts after the field and its dimensions.
pat = line . slice ( 1 + H + 1 , 1 + H + 1 + R ) ;


// Explicitly dispose of the 'line' array to free up memory,
// as its contents have been parsed into H, W, field, R, C, and pat.
line = null ;


// Perform an early exit if the pattern dimensions are larger than the field dimensions.
// In such a case, no match is possible.
if ( H < R || W < C )
{
    process . exit ( ) ;
}


/*
 * This section defines utility functions for string segmentation.
 * The core idea is to break down long binary strings into
 * fixed-length numeric segments for efficient comparison.
 */

// Define the fixed length for each segment number.
const SEGMENT_NUMBER_LENGTH = 30 ;


/**
 * Converts a binary string into an array of numeric segments.
 * Each segment is a number representing a part of the reversed binary string.
 * This approach is likely used for efficient bitwise comparisons.
 *
 * @param {string} str The input binary string (e.g., '0110101...').
 * @returns {object} An object containing 'length', 'offset', and 'body' (array of segments).
 */
function makeSegment ( str ) {

    var ary , i ; // Declare local variables.

    ary = [ ] ; // Initialize an empty array to store segments.

    // Loop through the string, extracting fixed-length substrings.
    for ( i = 0 ; i < str . length ; i += SEGMENT_NUMBER_LENGTH )
    {
        ary . push ( str . substr ( i , SEGMENT_NUMBER_LENGTH ) ) ;
    }

    // Convert each substring segment into an integer.
    // The substring is first reversed and then parsed as a binary number.
    ary = ary . map ( function ( str ) {
        return parseInt ( str . split ( '' ) . reverse ( ) . join ( '' ) , 2 ) ;
    } ) ;

    // Return the segment object.
    return { 'length' : str . length , 'offset' : 0 , 'body' : ary } ;
}


/**
 * Checks if a 'shortSegment' is a head (prefix) of a 'longSegment'.
 * This comparison is done on their numeric segment bodies.
 *
 * @param {object} longSegment The segment object representing the longer string.
 * @param {object} shortSegment The segment object representing the shorter string (potential head).
 * @returns {boolean} True if shortSegment is a head of longSegment, false otherwise.
 */
function isHead ( longSegment , shortSegment ) {
    var llen , slen , lofst , sofst , l , s ; // Local variables for lengths, offsets, and bodies.

    // Assert that the long segment's length is indeed greater than or equal to the short segment's length.
    assert ( longSegment . length >= shortSegment . length ) ;

    llen = longSegment . length ;   // Get total length of the long segment.
    slen = shortSegment . length ;  // Get total length of the short segment.

    lofst = longSegment . offset ;  // Get current offset into the long segment's body.
    sofst = shortSegment . offset ; // Get current offset into the short segment's body.

    l = longSegment . body ; // Reference to the long segment's body array.
    s = shortSegment . body ; // Reference to the short segment's body array.

    // Iterate while the remaining length of the short segment is greater than the segment number length.
    // This means there are full segments to compare.
    while ( slen > SEGMENT_NUMBER_LENGTH ) {
        if ( s [ sofst ] !== l [ lofst ] )
        {
            return false ; // If full segments don't match, it's not a head.
        }
        sofst ++ ; // Move to the next segment in shortSegment.
        lofst ++ ; // Move to the next segment in longSegment.
        slen -= SEGMENT_NUMBER_LENGTH ; // Decrease remaining length of shortSegment.
        llen -= SEGMENT_NUMBER_LENGTH ; // Decrease remaining length of longSegment.
    }

    // After comparing full segments, compare the remaining partial segment (if any).
    // This uses a bitwise AND operation with a mask (1 << slen) to check the prefix.
    return ( l [ lofst ] % ( 1 << slen ) === s [ sofst ] ) ;
}


/**
 * Shifts a segment by one full SEGMENT_NUMBER_LENGTH.
 * This effectively removes the first full segment from consideration.
 *
 * @param {object} seg The segment object to be shifted.
 * @returns {object|null} The shifted segment object, or null if it becomes empty.
 */
function shiftSegment ( seg ) {
    seg . length -= SEGMENT_NUMBER_LENGTH ; // Decrease total length.
    seg . offset ++ ; // Increment the offset to point to the next segment.

    if ( seg . length <= 0 )
    {
        return null ; // If no content left, return null.
    }

    return seg ; // Return the modified segment object.
}


/**
 * Creates a series of segment objects from a given string.
 * Each element in the series represents the original string
 * shifted by an increasing number of characters (0 to SEGMENT_NUMBER_LENGTH - 1).
 *
 * @param {string} str The input string.
 * @returns {Array<object|null>} An array of segment objects.
 */
function makeSegmentSeries ( str ) {
    var res , i ; // Declare local variables.

    res = new Array ( SEGMENT_NUMBER_LENGTH ) ; // Initialize an array to hold the series.

    // Initialize all elements of the result array to null.
    for ( i = 0 ; i < SEGMENT_NUMBER_LENGTH ; i ++ )
    {
        res [ i ] = null ;
    }

    // For each possible starting shift (0 to SEGMENT_NUMBER_LENGTH - 1),
    // create a segment object from the sliced string.
    for ( i = 0 ; i < SEGMENT_NUMBER_LENGTH && i < str . length ; i ++ )
    {
        res [ i ] = makeSegment ( str . slice ( i ) ) ;
    }

    return res ; // Return the created segment series.
}


/**
 * Copies the properties of source segment series objects to destination segment series objects.
 * This is a deep copy for the segment objects themselves, but not for their internal 'body' arrays.
 *
 * @param {Array} dst The destination array for segment series.
 * @param {Array} src The source array of segment series.
 */
function copySegmentSeries ( dst , src ) {
    var i , j , src_i , dst_i ; // Local variables.

    // Iterate over the indices of the source array.
    for ( i in src ) {
        src_i = src [ i ] ; // Get the current source segment object.

        if ( ! src_i ) {
            dst [ i ] = null ; // If source is null, set destination to null.
            continue ; // Move to the next element.
        }

        dst_i = dst [ i ] ; // Get the current destination segment object.

        if ( ! dst_i )
        {
            dst_i = { } ; // If destination is null, initialize a new empty object.
        }

        // Copy properties from src_i to dst_i. This acts like Object.assign.
        for ( j in src_i )
        {
            dst_i [ j ] = src_i [ j ] ;
        }

        dst [ i ] = dst_i ; // Assign the (potentially new) destination object back to the array.
    }
}


// Global array used within segmentMatch to avoid repeated allocations.
// This array will hold a working copy of the segment series.
segmentSeriesInSegmentMatch = new Array ( SEGMENT_NUMBER_LENGTH ) ;


/**
 * Performs a pattern match using segment series.
 * It checks if a given 'segment' (pattern) is a head of any shifted version
 * within the 'segmentSeries'.
 *
 * @param {Array} segmentSeries An array of segment objects, representing a string and its shifts.
 * @param {object} segment The pattern segment to match.
 * @returns {Array<boolean>} An array of boolean results, indicating matches for each shift.
 */
function segmentMatch ( segmentSeries , segment ) {
    var series , res , i ; // Local variables.

    series = segmentSeriesInSegmentMatch ; // Use the global temporary series array.

    copySegmentSeries ( series , segmentSeries ) ; // Make a working copy of the segment series.

    res = [ ] ; // Initialize array to store match results.

    i = 0 ; // Initialize loop counter (index for the series).

    // Loop while there are segments in the series that are long enough to potentially contain the pattern.
    while ( series [ i ] && series [ i ] . length >= segment . length ) {
        res . push ( isHead ( series [ i ] , segment ) ) ; // Check if the current series segment is a head.
        series [ i ] = shiftSegment ( series [ i ] ) ; // Shift the current series segment for the next iteration.
        i ++ ; // Increment index.
        if ( i === SEGMENT_NUMBER_LENGTH )
        {
            i = 0 ; // Wrap around if index reaches SEGMENT_NUMBER_LENGTH (circular buffer-like behavior).
        }
    }

    return res ; // Return the array of match results.
}


// Transform the 'field' data: each line string is converted into a segment series.
field = field . map ( makeSegmentSeries ) ;

// Transform the 'pat' data: each pattern line string is converted into a single segment.
pat = pat . map ( makeSegment ) ;


/*
 * This section implements the main 2D pattern matching algorithm.
 * It iterates through possible top-left positions for the pattern
 * within the field and counts the number of matching rows.
 */

// Initialize a 2D array 'mem' to store match counts.
// Its dimensions are (H - R + 1) by (W - C + 1), representing
// all possible top-left coordinates for the pattern.
mem = new Array ( H - R + 1 ) ;

// Initialize all elements of 'mem' to 0.
for ( i = 0 ; i <= H - R ; i ++ ) {
    mem [ i ] = new Array ( W - C + 1 ) ;
    for ( j = 0 ; j <= W - C ; j ++ )
    {
        mem [ i ] [ j ] = 0 ;
    }
}


// Core pattern matching loop.
// Iterate through each row of the field (i).
for ( i = 0 ; i < H ; i ++ ) {
    // Iterate through each row of the pattern (j).
    // The condition 'j = Math.max(0, i-H+R)' ensures 'i-j' (field row - pattern row) is within bounds for mem.
    // 'j < R && j <= i' ensures 'j' is a valid pattern row index and 'i' is not less than 'j'.
    for ( j = Math . max ( 0 , i - H + R ) ; j < R && j <= i ; j ++ ) {
        // Perform segment matching between a field row's series and a pattern row's segment.
        match = segmentMatch ( field [ i ] , pat [ j ] ) ;

        // Iterate through the results of the segmentMatch.
        // 'k' represents the column offset within the field row.
        for ( k in match ) {
            if ( ! match [ k ] )
            {
                continue ; // If there's no match for this specific offset, skip.
            }
            // If there's a match, increment the count in 'mem' at the corresponding
            // top-left position (i-j, k). 'i-j' is the row offset, 'k' is the column offset.
            mem [ i - j ] [ k ] ++ ;
        }
    }
}


// Final output stage: print the coordinates where the pattern fully matches.
// A full match occurs when 'mem[i][j]' equals 'R' (the number of rows in the pattern).
for ( i in mem )
{
    for ( j in mem [ i ] )
    {
        if ( mem [ i ] [ j ] === R )
        {
            console . log ( '%s %s' , i , j ) ; // Output the row and column of the match.
        }
    }
}