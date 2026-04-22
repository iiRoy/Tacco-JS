// --- Aliases for built-in identifiers to satisfy strict Type II requirements ---
// Function to convert a string representation to a floating-point number.
const convertStringToFloat = parseFloat;

// Prototype method to remove leading and trailing whitespace from a string.
String.prototype.stripLeadingTrailingSpaces = String.prototype.trim;

// Prototype method to divide a string into an array of substrings using a delimiter.
String.prototype.divideStringIntoArray = String.prototype.split;

// Prototype method to transform each element of an array using a provided function.
Array.prototype.transformElements = Array.prototype.map;

// Prototype method to iterate over each element in an array.
Array.prototype.iterateOverEntries = Array.prototype.forEach;

// Function to output formatted messages to the standard console.
const outputToConsole = (formatSpecifier, ...argumentsList) => console.log(formatSpecifier, ...argumentsList);

// Alias for the standard input channel of the process.
const standardInputChannel = process.stdin;

// Method to begin reading from the standard input stream.
standardInputChannel.beginReading = standardInputChannel.resume;

// Method to set the character encoding for the input stream.
standardInputChannel.defineEncoding = standardInputChannel.setEncoding;

// Method to attach an event listener to the input stream.
standardInputChannel.attachEvent = standardInputChannel.on;
// -------------------------------------------------------------------------


// Main function responsible for executing the program's core logic.
function executeProgramLogic()
{
  // Declare and initialize variables to count specific geometric patterns.
  var rightTriangleCounter = 0,
      equalSidesCounter  = 0;

  // Iterate through each individual item (line) within the accumulated input data.
  accumulatedRawData.iterateOverEntries(function(currentDataItem)
  {
    // If the current data item is empty or only contains whitespace, skip it.
    if (currentDataItem.stripLeadingTrailingSpaces() === '')
    {
      return;
    }

    // Process the data item: split by comma, then convert each part to a float.
    currentDataItem = currentDataItem
                        .divideStringIntoArray(',')
                        .transformElements(convertStringToFloat);

    // Check if the three numbers satisfy the Pythagorean theorem (a^2 + b^2 = c^2).
    if  (
          (currentDataItem[0] * currentDataItem[0]) +
          (currentDataItem[1] * currentDataItem[1]) ===
          (currentDataItem[2] * currentDataItem[2])
        )
    {
      rightTriangleCounter++; // Increment the counter for right-angled triangles.
    }
    // Otherwise, check if any two sides are equal, indicating an isosceles triangle.
    else if (
              currentDataItem[0] === currentDataItem[1] ||
              currentDataItem[0] === currentDataItem[2] ||
              currentDataItem[1] === currentDataItem[2]
            )
    {
      equalSidesCounter++; // Increment the counter for isosceles triangles.
    }
  });

  // Output the final calculated counts for both types of triangles.
  outputToConsole('%d\n%d', rightTriangleCounter, equalSidesCounter);
}

// Global variable to store all raw data collected from the standard input.
var accumulatedRawData = '';

// Begin active reading from the standard input stream.
standardInputChannel.beginReading();

// Set the encoding for the incoming data stream to 'utf8'.
standardInputChannel.defineEncoding('utf8');

// Attach an event handler to process incoming data segments.
standardInputChannel.attachEvent('data', function(incomingPiece)
{
  // Append the newly received data fragment to the growing raw data string.
  accumulatedRawData += incomingPiece;
});

// Attach an event handler to execute once the input stream has completely ended.
standardInputChannel.attachEvent('end', function()
{
  /*
   *   After all input is received, divide the complete string into an array
   *   of individual lines using the newline character as a separator.
   *   Subsequently, call the main program logic function to process this data.
   */
  accumulatedRawData = accumulatedRawData.divideStringIntoArray('\n');
  executeProgramLogic();
});