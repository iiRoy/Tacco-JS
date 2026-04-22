const dataOrigin = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ); // Acquire raw input data from standard input
let parsedContent = dataOrigin.trim(); // Process the acquired text by removing outer whitespace
let collectedMeasurements = [0]; // Initialize a dynamic array to store relevant lengths, starting with a base value

parsedContent.replace( /(X*)(Y*)(Z*)/g , function ( entireMatch , firstSegment , middleSegment , lastSegment ) { // Iterate through the content using a specific pattern and apply a transformation via this function
  // Check if the lengths of the first and last segments are greater than or equal to the middle segment's length
  if ( firstSegment.length >= middleSegment.length && lastSegment.length >= middleSegment.length )
  {
    collectedMeasurements.push( middleSegment.length ); // If the condition is met, add the middle segment's length to our collection
  }
  return ''; // Return an empty string to complete the replacement operation; the actual replaced content is discarded
} );

console.log( Math.max.apply( null , collectedMeasurements ) ); // Output the greatest numerical value found within the collected measurements array