// This array stores the distinct labels associated with various positions.
var  posMarkers = ["A", "B", "C"];

/**
 *  Performs an in-place exchange of two elements within a given array.
 *  @param  {Array<any>} targetList      The array whose elements are to be interchanged.
 *  @param  {number}     firstPosition   The zero-based index of the initial element.
 *  @param  {number}     secondPosition  The zero-based index of the secondary element.
 */
function transposeItems( targetList, firstPosition, secondPosition )
{
  var interimStorage = targetList[firstPosition]; // Holds the value from the first designated position temporarily.
  targetList[firstPosition]  =  targetList[secondPosition]; // Moves the value from the second position to the first.
  targetList[secondPosition] = interimStorage; // Places the stored value into the second designated position.
}


// Obtain the core Node.js 'fs' module for file system interactions.
var   fileSystemUtil   =  require('fs');

// Read all incoming data from standard input ('/dev/stdin') using UTF-8 encoding.
var rawStreamData = fileSystemUtil.readFileSync( '/dev/stdin', 'utf8' );

// Pre-process the raw input: trim any surrounding whitespace, then segment it into an array of strings at each newline character.
var    commandStrings    =    rawStreamData.trim().split('\n');

// Declare an array to represent the current state or "location" of an active item.
// A '1' indicates the active item, while '0' indicates an inactive position.
var itemIndicators = [1,0,0];

var     currentCommandString;

// Continuously process each command string from the input array until none remain.
while  ( currentCommandString = commandStrings.shift() )
{
    // Deconstruct the current command string into its component parts, delimited by a comma.
    var parsedInstruction = currentCommandString.split(',');

    // Execute the item transposition. The string labels from the instruction are converted to numerical indices
    // using the 'posMarkers' array for lookup.
    transposeItems(
        itemIndicators,
        posMarkers.indexOf( parsedInstruction[0] ),
        posMarkers.indexOf( parsedInstruction[1] )
    );
}


// After all movement commands have been processed, identify the final position of the active item.
for ( var positionIndex = 0; positionIndex < itemIndicators.length; positionIndex++ )
{
    // Check if the current position in the 'itemIndicators' array holds the active flag (which is '1').
    if ( itemIndicators[positionIndex] ) {
        // If the active flag is found, print its corresponding label from 'posMarkers'.
        console.log( posMarkers[positionIndex] );
        break; // Once found, there's no need to check further positions.
    }
}