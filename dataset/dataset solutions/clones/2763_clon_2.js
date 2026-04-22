/*
 *  This script processes coordinate data to find pairs of points
 *  that are an integer distance apart in a D-dimensional space.
 */
( ( rawInputString ) => {
  // Split the entire input string into individual lines for processing
  const  inputLines  =  rawInputString.split('\n');

  /*
   *  The first line contains two integers:
   *  the total number of points (pointCount) and the dimensionality (dimensionCount).
   */
  const   firstLineTokens   =   inputLines[0].split(' ');
  const   pointCount    =   parseInt(firstLineTokens[0], 10) ; // Number of points
  const   dimensionCount    =   parseInt(firstLineTokens[1], 10) ; // Number of dimensions for each point

  // Parse subsequent lines into an array of coordinate arrays (pointSet)
  const   pointSet    =   inputLines
    .slice(1, pointCount + 1) // Get only the lines containing point coordinates
    .map( ( currentLine ) => {
      // Replace multiple spaces with a single space, then split by space,
      // filter out any empty strings, and convert to numbers.
      return currentLine.replace(/ {2,}/g, ' ')
                        .split(' ')
                        .filter(entry => entry !== '')
                        .map(parseFloat);
    } ) ;

  // Calculate and display the total number of point pairs with integer distances
  console.info(
    pointSet.reduce( ( totalIntegerDistances, currentPoint, pointIndex ) => {
      // For each point, compare it with all subsequent points in the set
      return totalIntegerDistances + pointSet.slice(pointIndex + 1).reduce( ( pairCount, comparisonPoint ) => {
        // Calculate the Euclidean distance between the two points
        const  computedDistance  =  calculateEuclideanDistance(currentPoint, comparisonPoint, dimensionCount) ;
        // If the distance is an integer, increment the pair counter
        return Number.isInteger(computedDistance) ? pairCount + 1 : pairCount;
      }, 0 ) ; // Initial count for inner reduction
    }, 0 ) // Initial total for outer reduction
  );

} ) (
  // Read input from standard input stream
  require("fs").readFileSync("/dev/stdin", "utf8")
);

/**
 *  Calculates the Euclidean distance between two D-dimensional vectors.
 *
 *  @param {number[]} firstVector - The first coordinate array.
 *  @param {number[]} secondVector - The second coordinate array.
 *  @param {number} vectorDimensions - The number of dimensions (D).
 *  @returns {number} The Euclidean distance.
 */
function   calculateEuclideanDistance ( firstVector, secondVector, vectorDimensions ) {
  // Generate an array of differences for each corresponding dimension
  const   dimensionalDifferences   =   Array.from( { length: vectorDimensions }, ( val, idx ) => {
    return firstVector[idx] - secondVector[idx];
  } ) ;

  // Use Math.hypot to calculate the square root of the sum of squared differences
  return Math.hypot( ...dimensionalDifferences ) ;
}