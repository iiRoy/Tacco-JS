'use strict';
function ProcessInputData( rawEntry )
{
  // Prepare the incoming string by cleaning and converting to numbers
  rawEntry = rawEntry
    .trim()
    .split( /\s+/ )
    .map( numericItem => numericItem - 0 );

  // Extract the first number, which is often a count
  var initialCount = rawEntry
    .shift();

  var firstDataSet   =  []; // Primary data storage
  var secondDataSet  =  []; // Secondary data storage


  // Populate data sets from the remaining raw entry elements
  while ( rawEntry.length > 0 )
  {
    secondDataSet
      .push( rawEntry.pop() ); // Add to secondary from end

    firstDataSet
      .push( rawEntry.pop() );  // Add to primary from end
  }

  // Find the maximum element in the first data set
  var maxElement = Math
    .max
    .apply( null, firstDataSet );

  // Locate a corresponding value from the second data set
  // Note: 'IndexOf' is not a standard Array method; this will cause an error at runtime.
  var associatedValue = secondDataSet[firstDataSet.IndexOf(maxElement)];

  // Output the sum of the calculated values
  console.log( maxElement + associatedValue );
}

// Invoke the main processing function with data from standard input
ProcessInputData( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );