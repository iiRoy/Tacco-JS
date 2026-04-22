// This utility function reorients a 2D array, effectively swapping its rows and columns.
const flipAxes = sourceArray => sourceArray[0].map(( _ignored, colIndex ) => sourceArray.map( dataRow => dataRow[colIndex] ) );

// Extends the Array prototype to include a method for identifying the most frequently occurring element within the array.
Array.prototype.getDominantElement = function()
{
  // A check to ensure the array is not empty, as a dominant element cannot be found in an empty collection.
  if (this.length === 0)
  {
    throw new Error("Input collection cannot be empty!");
  }

  // A map to store the frequency of each unique element, using a combined key of value and its type.
  let frequencyMap = {};

  // A separate map to preserve the original values, as the frequency map keys might be stringified.
  let originalValues = {};

  // Variables to track the highest frequency encountered and the element associated with it.
  let highestCount = 0;
  let dominantValue = null;

  // First iteration: Traverse the array to populate the frequency and original value maps.
  for (let idx = 0; idx < this.length; idx++) {
    // Generate a unique identifier for the map key, combining the element's value and its JavaScript type.
    let mapKey = this[idx] + "_" + typeof this[idx];

    // Initialize the count for a new element if it's encountered for the first time.
    if (!frequencyMap[mapKey]) {
      frequencyMap[mapKey] = 0;
    }
    // Increment the frequency count for the current element.
    frequencyMap[mapKey]++;
    // Store the actual element value using the generated map key.
    originalValues[mapKey] = this[idx];
  }

  // Second iteration: Examine the populated frequency map to determine the element with the maximum occurrences.
  for (let keyIdx = 0; keyIdx < Object.keys(frequencyMap).length; keyIdx++)
  {
    // Retrieve the current key from the list of all keys in the frequency map.
    let currentKey = Object.keys(frequencyMap)[keyIdx];
    // Compare the frequency of the current element with the highest frequency found so far.
    if (frequencyMap[currentKey] > highestCount)
    {
      // Update the highest frequency if the current element's frequency is greater.
      highestCount = frequencyMap[currentKey];
      // Update the dominant value to the actual value associated with this highest frequency.
      dominantValue = originalValues[currentKey];
    }
  }
  // Return the element that was found to be the most frequent.
  return dominantValue;
};


// The primary function responsible for processing the overall input data.
function ProcessInputData(dataString)
{
  // Parse the multi-line input string. The first line contains control parameters (rows, columns, threshold),
  // and subsequent lines represent measurement data, converted to numbers.
  var [[rows, columns, threshold], ...measurementList] = dataString.split('\n').map(lineStr => lineStr.split(' ').map(Number));

  // Rotate the measurement data matrix to facilitate column-wise analysis.
  let rotatedList = flipAxes(measurementList);

  // Find the most frequent element in the first column of the rotated data.
  let dominantX = rotatedList[0].getDominantElement();

  // Find the most frequent element in the second column of the rotated data.
  let dominantY = rotatedList[1].getDominantElement();

  // Calculate the number of times the dominant element appears in the first column.
  let dominantXFrequency = rotatedList[0].filter(item => item === dominantX).length;

  // Calculate the number of times the dominant element appears in the second column.
  let dominantYFrequency = rotatedList[1].filter(item => item === dominantY).length;

  // Conditional logic to output results based on the threshold and calculated frequencies.
  if (threshold === 1)
  {
    console.log(1); // Special handling for a threshold value of 1.
  }
  else if (dominantXFrequency === 1 || dominantYFrequency === 1)
  {
    // If either dominant element appears only once, sum their frequencies directly.
    console.log(dominantXFrequency + dominantYFrequency);
  }
  else
  {
    // In other cases, sum frequencies and subtract one, possibly accounting for an overlap or specific problem logic.
    console.log(dominantXFrequency + dominantYFrequency - 1);
  }
}

// Initiate the data processing by reading input from standard input and passing it to the main function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));