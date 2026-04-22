// The entire input data is contained in rawData.
function ProcessData(rawData)
{
  // Each line of input is stored in an array: rawData[0] for the first line, rawData[1] for the second, and so on.
  rawData = rawData.split("\n");

  var lineTwoElements = rawData[1].split(" "); /* Split the second line of input data by spaces */

  // For converting a string to a base-10 integer, use parseInt with the radix parameter.
  var quantity = parseInt(rawData[0], 10);

  var elevationPoints = parseAllIntegers(lineTwoElements); /* Convert all elements of the split line to integers */
  var totalElevation = 0; // Initialize a variable to accumulate the sum of all elevation points.

  for
  (
    var idx = 0;
    idx < elevationPoints.length;
    idx++
  )
  {
    totalElevation += elevationPoints[idx]; // Summing up all elevation points in the array
  }

  var alternateSum = 0; // Initialize a sum for elements at odd indices (1, 3, 5, ...)
  for (var idx = 1; idx < elevationPoints.length; idx += 2)
  {
    alternateSum += elevationPoints[idx]; /* Summing every second element starting from the second one (index 1) */
  }

  var initialMountainValue = totalElevation - (2 * alternateSum); // Calculate the first mountain value based on total and alternate sums

  var calculatedPeaks = []; /* Array to store calculated mountain peak values */
  calculatedPeaks[0] = initialMountainValue;

  for
  (
    var idx = 1;
    idx < elevationPoints.length;
    idx++
  )
  {
    // Calculate subsequent mountain values based on the previous mountain value and the current elevation point
    calculatedPeaks[idx] = (elevationPoints[idx - 1] - (calculatedPeaks[idx - 1] / 2)) * 2;
  }
  // Display the final result to the console.
  console.log('%s', formatWithSpaces(calculatedPeaks));
}

// This utility function takes an array of strings and converts each element to an integer.
function parseAllIntegers(stringArray)
{
  var integerArray = []; // Create a new array to hold the parsed integers.
  for (var k = 0; k < stringArray.length; k++)
  {
    integerArray[k] = parseInt(stringArray[k]); // Convert each string element to an integer using parseInt
  }
  return integerArray; // Return the array of integers.
}

// This helper function takes an array of numbers, joins them into a single string with spaces, and appends a newline.
function formatWithSpaces(numberCollection)
{
  var formattedOutput = numberCollection.join(' '); // Join the numbers with a space character.
  formattedOutput += '\n'; // Append a newline character at the end of the string.
  return formattedOutput; // Return the final formatted string.
}

// Do not modify anything below this line (this part handles reading input from standard input and invoking the main processing function)
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));