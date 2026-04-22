/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly as they were in the source.
 * Only whitespace (indentation, spacing, blank lines) and comments
 * have been altered extensively to create visual difference.
 */

// Configuration object setup
// The 'config' variable holds settings for input and newline characters.
// The first line is commented out, likely for Windows compatibility,
// while the second line is active for Linux/Unix systems.
// config = { input: 'tmp', newline: '\r\n' }; // Windows-specific input configuration
config = { input: '/dev/stdin', newline: '\n' }; // Linux/Unix-specific input configuration


// Require the 'assert' module for assertions.
const assert = require('assert');


// Read input from the specified source.
// The entire content is read as 'ascii' and then split into an array of lines.
line = require('fs') . readFileSync ( config . input , 'ascii' )
  . split ( config . newline ) ;


// Process the first line of input to get H and W values.
// It's split by space and then each part converted to a Number.
line [ 0 ] = line [ 0 ] . split ( ' ' ) . map ( Number ) ;

// Assign H (height) from the first element of the processed line.
H = line [ 0 ] [ 0 ] ;

// Assign W (width) from the second element.
W = line [ 0 ] [ 1 ] ;


// Extract the 'field' data from the lines.
// This slices the 'line' array from index 1 up to 1+H.
field = line . slice ( 1 , 1 + H ) ;


// Process the line immediately following the field data to get R and C.
// Similar to H and W, it's split by space and mapped to numbers.
line [ 1 + H ] = line [ 1 + H ] . split ( ' ' ) . map ( Number ) ;

// Assign R (pattern height) from the first element.
R = line [ 1 + H ] [ 0 ] ;

// Assign C (pattern width) from the second element.
C = line [ 1 + H ] [ 1 ] ;


// Extract the 'pat' (pattern) data.
// This slices the 'line' array starting after the field and R/C line, for R lines.
pat = line . slice ( 1 + H + 1 , 1 + H + 1 + R ) ;


// Explicitly set 'line' to null to free up memory, as it's no longer needed.
line = null ; // Dispose of the large 'line' array to optimize memory usage


// Perform an early exit if the pattern dimensions are larger than the field dimensions.
// This check prevents unnecessary processing if a match is impossible.
if ( H < R || W < C ) process . exit ( ) ;


/*
 * This section defines functions related to segmenting strings
 * for efficient pattern matching, particularly useful for binary string comparisons.
 * The core idea is to convert parts of strings into numbers for faster comparison.
 */

// Define the fixed length for each segment number.
// This constant determines how many characters (bits) are packed into one number.
const SEGMENT_NUMBER_LENGTH = 31 ;


/**
 * Converts a given string into an array of numeric segments.
 * Each segment is an integer representation of a portion of the string,
 * interpreted as a binary number (reversed).
 *
 * @param {string} str - The input string to be segmented.
 * @returns {object} An object containing the original string's length,
 *                   an offset (initially 0), and the array of numeric segments.
 */
function makeSegment ( str ) {
  var ary , i ; // Declare local variables: 'ary' for segments, 'i' for loop counter.

  ary = [ ] ; // Initialize 'ary' as an empty array.

  // Loop through the string, taking chunks of SEGMENT_NUMBER_LENGTH.
  for ( i = 0 ; i < str . length ; i += SEGMENT_NUMBER_LENGTH )
    ary . push ( str . substr ( i , SEGMENT_NUMBER_LENGTH ) ) ; // Add each chunk to 'ary'.

  // Convert each string chunk into an integer.
  // The chunk is reversed, then joined, then parsed as a base-2 integer.
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
 * @param {object} longSegment - The longer segment object.
 * @param {object} shortSegment - The shorter segment object.
 * @returns {boolean} True if shortSegment is a head of longSegment, false otherwise.
 */
function isHead ( longSegment , shortSegment ) {
  var llen , slen , lofst , sofst , l , s ; // Declare local variables.

  // Assert that the long segment is indeed longer or equal in length.
  assert ( longSegment . length >= shortSegment . length ) ;

  // Extract lengths and offsets from the segment objects.
  llen = longSegment . length ;
  slen = shortSegment . length ;
  lofst = longSegment . offset ;
  sofst = shortSegment . offset ;

  // Get the numeric body arrays.
  l = longSegment . body ;
  s = shortSegment . body ;

  // Compare full segments while the short segment's remaining length is greater than SEGMENT_NUMBER_LENGTH.
  while ( slen > SEGMENT_NUMBER_LENGTH ) {
    if ( s [ sofst ] !== l [ lofst ] ) return false ; // If a full segment doesn't match, return false.
    sofst ++ ; // Advance short segment offset.
    lofst ++ ; // Advance long segment offset.
    slen -= SEGMENT_NUMBER_LENGTH ; // Reduce remaining lengths.
    llen -= SEGMENT_NUMBER_LENGTH ;
  }

  // Compare the final, potentially partial, segment.
  // Use modulo and Math.pow to get the relevant bits for comparison.
  return ( ( l [ lofst ] % Math . pow ( 2 , slen ) ) === s [ sofst ] ) ;
}


/**
 * Shifts a segment by one SEGMENT_NUMBER_LENGTH, effectively removing the first chunk.
 * This is used to advance through a segment's body.
 *
 * @param {object} seg - The segment object to be shifted.
 * @returns {object|null} The modified segment object, or null if the segment becomes empty.
 */
function shiftSegment ( seg ) {
  seg . length -= SEGMENT_NUMBER_LENGTH ; // Decrease the segment's total length.
  seg . offset ++ ; // Increment the offset to point to the next segment in its body array.

  if ( seg . length <= 0 ) return null ; // If the segment is now empty or invalid, return null.

  return seg ; // Return the modified segment.
}


/**
 * Creates a series of segments for a given string.
 * Each element in the series is a segment of the string starting at a different offset.
 *
 * @param {string} str - The input string.
 * @returns {Array<object|null>} An array where each element `res[i]` is a segment
 *                               of `str.slice(i)`, or null if `i` is out of bounds.
 */
function makeSegmentSeries ( str ) {
  var res , i ; // Declare local variables.

  res = new Array ( SEGMENT_NUMBER_LENGTH ) ; // Initialize 'res' array with a fixed size.

  // Fill the 'res' array with nulls initially.
  for ( i = 0 ; i < SEGMENT_NUMBER_LENGTH ; i ++ ) res [ i ] = null ;

  // Populate 'res' with segments, each starting one character later than the previous.
  for ( i = 0 ; i < SEGMENT_NUMBER_LENGTH && i < str . length ; i ++ )
    res [ i ] = makeSegment ( str . slice ( i ) ) ; // Create a segment from the sliced string.

  return res ; // Return the segment series.
}


/**
 * Copies the properties of source segments to destination segments.
 * This is a shallow copy, suitable for segment objects.
 *
 * @param {Array<object|null>} dst - The destination array of segment objects.
 * @param {Array<object|null>} src - The source array of segment objects.
 */
function copySegmentSeries ( dst , src ) {
  var i , dst_i , src_i ; // Declare local variables.

  // Iterate over properties (indices) of the source array.
  for ( i in src ) {
    if ( ! src [ i ] ) {
      dst [ i ] = null ; // If source element is null, set destination to null.
      continue ; // Move to the next element.
    }
    if ( ! dst [ i ] ) {
      // If destination element doesn't exist, create a new object and assign.
      dst [ i ] = Object . assign ( { } , src [ i ] ) ;
    } else {
      // If destination element exists, update its properties.
      Object . assign ( dst [ i ] , src [ i ] ) ;
    }
  }
}


// Global array used within segmentMatch to avoid repeated allocations.
// This array will hold copies of segment series for matching.
segmentSeriesInSegmentMatch = new Array ( SEGMENT_NUMBER_LENGTH ) ;


/**
 * Performs a pattern match using segment series.
 * It checks if a given 'segment' (pattern) is a head of any shifted segment
 * within the 'segmentSeries' (text line).
 *
 * @param {Array<object|null>} segmentSeries - The series of segments representing a line of text.
 * @param {object} segment - The pattern segment to match.
 * @returns {Array<boolean>} An array of booleans indicating match results for each shift position.
 */
function segmentMatch ( segmentSeries , segment ) {
  var series , res , i ; // Declare local variables.

  series = segmentSeriesInSegmentMatch ; // Use the pre-allocated global array.
  copySegmentSeries ( series , segmentSeries ) ; // Copy the input series to the working array.

  res = [ ] ; // Initialize result array.
  i = 0 ; // Initialize loop counter for segment series index.

  // Loop while the current series segment exists and is long enough to contain the pattern segment.
  while ( series [ i ] && series [ i ] . length >= segment . length ) {
    res . push ( isHead ( series [ i ] , segment ) ) ; // Check for a match and store the result.
    series [ i ] = shiftSegment ( series [ i ] ) ; // Shift the current series segment.
    i ++ ; // Move to the next index in the series.
    if ( i === SEGMENT_NUMBER_LENGTH ) i = 0 ; // Wrap around if 'i' reaches the end of the series array.
  }

  return res ; // Return the array of match results.
}


// Transform the 'field' array by converting each string line into a segment series.
field = field . map ( makeSegmentSeries ) ;

// Transform the 'pat' (pattern) array by converting each string line into a single segment.
pat = pat . map ( makeSegment ) ;


/*
 * This section implements the main pattern matching logic.
 * It iterates through the field and pattern segments to find occurrences
 * of the pattern within the field, storing results in a 'mem' array.
 */

// Initialize 'mem' (memory) array.
// Its dimensions are (H-R+1) x (W-C+1), representing possible top-left corners of the pattern.
mem = new Array ( H - R + 1 ) ;

// Fill the 'mem' array with zeros.
// Each cell `mem[i][j]` will count how many rows of the pattern match at position (i, j).
for ( i = 0 ; i <= H - R ; i ++ ) {
  mem [ i ] = new Array ( W - C + 1 ) ;
  for ( j = 0 ; j <= W - C ; j ++ ) mem [ i ] [ j ] = 0 ;
}


// Main pattern matching loops.
// Iterate through each row of the field.
for ( i = 0 ; i < H ; i ++ ) {
  // Iterate through relevant pattern rows 'j' that could align with field row 'i'.
  for ( j = Math . max ( 0 , i - H + R ) ; j < R && j <= i ; j ++ ) {
    // Perform segment matching between the current field row and pattern row.
    match = segmentMatch ( field [ i ] , pat [ j ] ) ;

    // Iterate through the results of the segment match.
    for ( k in match ) {
      if ( ! match [ k ] ) continue ; // If there's no match at this position, skip.
      mem [ i - j ] [ k ] ++ ; // Increment the counter for a potential pattern match at (i-j, k).
    }
  }
}


// Output the results.
// Iterate through the 'mem' array.
for ( i in mem )
  for ( j in mem [ i ] )
    // If a cell in 'mem' equals R (the number of pattern rows),
    // it means all rows of the pattern matched at that top-left position.
    if ( mem [ i ] [ j ] === R ) console . log ( '%s %s' , i , j ) ; // Print the coordinates.