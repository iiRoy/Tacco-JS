function main( input )
{
  // This function serves as the primary entry point for processing the input data.

  var inputs = input.split( '\n' ); // Split the entire input string by newline characters.

  // Extract N and M from the first line of input.
  var n = Number( inputs[0].split( ' ' )[0] ); // N represents the number of data entries.
  var m = Number( inputs[0].split( ' ' )[1] ); // M represents the count for top sums.

  // Initialize eight arrays for storing sums based on different sign combinations (+/- for x, y, z).
  var ppp = []; // +x +y +z
  var ppm = []; // +x +y -z
  var pmp = []; // +x -y +z
  var pmm = []; // +x -y -z
  var mpp = []; // -x +y +z
  var mmp = []; // -x -y +z
  var mpm = []; // -x +y -z
  var mmm = []; // -x -y -z

  // Temporary arrays to hold x, y, z components for each entry.
  var xArray = [];
  var yArray = [];
  var zArray = [];

  /*
   * Loop through each of the N data entries.
   * Each entry is expected to be on its own line after the first line.
   */
  for ( var i = 0; i < n; i++ )
  {
    // Parse the current line into x, y, z components.
    var lines = inputs[ i + 1 ].split( ' ' );
    xArray[ i ] = Number( lines[0] ); // Store the x component.
    yArray[ i ] = Number( lines[1] ); // Store the y component.
    zArray[ i ] = Number( lines[2] ); // Store the z component.

    // Calculate and push sums for all 8 combinations into their respective arrays.
    ppp.push( xArray[i] + yArray[i] + zArray[i] ); // Sum with all positive signs.

    ppm.push( xArray[i] + yArray[i] - zArray[i] ); // Sum with positive x, y, negative z.

    pmp.push( xArray[i] - yArray[i] + zArray[i] ); // Sum with positive x, negative y, positive z.

    pmm.push( xArray[i] - yArray[i] - zArray[i] ); // Sum with positive x, negative y, negative z.

    mpp.push( -xArray[i] + yArray[i] + zArray[i] ); // Sum with negative x, positive y, positive z.

    mmp.push( -xArray[i] - yArray[i] + zArray[i] ); // Sum with negative x, negative y, positive z.

    mpm.push( -xArray[i] + yArray[i] - zArray[i] ); // Sum with negative x, positive y, negative z.

    mmm.push( -xArray[i] - yArray[i] - zArray[i] ); // Sum with all negative signs.
  }

  // Create an array to store the results of calc() for each combination.
  var rank = [];

  // Calculate the sum of the top M elements for each of the eight combination arrays.
  rank.push( calc( ppp, m ) ); // Calculate for +++ combination.
  rank.push( calc( ppm, m ) ); // Calculate for ++- combination.
  rank.push( calc( pmp, m ) ); // Calculate for +-+ combination.
  rank.push( calc( pmm, m ) ); // Calculate for +-- combination.
  rank.push( calc( mpp, m ) ); // Calculate for -++ combination.
  rank.push( calc( mmp, m ) ); // Calculate for --+ combination.
  rank.push( calc( mpm, m ) ); // Calculate for -+- combination.
  rank.push( calc( mmm, m ) ); // Calculate for --- combination.

  // Sort the 'rank' array in ascending order and get the last (largest) element.
  console.log( String( rank.sort().pop() ) ); // Convert the result to a string and print it.
}


/*
 * Helper function to calculate the sum of the top 'm' elements in an array.
 * It sorts the array in descending order, slices the top 'm' elements, and then sums them.
 */
function calc( array, m )
{
  return array.sort( function ( a, b ) {
                                          return b - a; // Sort in descending order.
                                        } )
              .slice( 0, m )             // Get the first 'm' elements (which are the largest).
              .reduce( function ( current, next ) {
                                                    return current + next; // Sum the 'm' elements.
                                                  },
                       0 );             // Initial value for the sum.
}

// Read input from standard input and pass it to the main function.
main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );