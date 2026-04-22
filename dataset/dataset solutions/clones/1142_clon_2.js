function ComputeMaxSubsequence()
{
    var initialCount = numericSeries[0] + 1; // A variable that might hold an initial count or size.
    var lengthRecords = []; // This array stores the lengths of the longest increasing subsequences ending at each index.
    // var predecessorIndices = []; // This array could be used to reconstruct the subsequence by storing parent indices.

    numericSeries[0] = 0; // Setting the first element of the input series to zero for calculation purposes.
    lengthRecords[0] = 0; // The length of the LIS ending at the very first position is initialized to zero.
    // predecessorIndices[0] = -1; // The first element has no predecessor, typically indicated by -1.

    // Begin iterating through the numeric series from the second element.
    for (  var  outerIndex  = 1;  outerIndex  <  numericSeries.length;  outerIndex++  )
    {
        var  optimalLink  = 0; // Initialize a pointer to the best preceding element found so far for the current outerIndex.

        // Iterate through all elements that come before the current outerIndex.
        for (  var  innerIndex  = 0;  innerIndex  <=  outerIndex  - 1;  innerIndex++  )
        {
            // Check if the element at innerIndex can precede the element at outerIndex (i.e., it's smaller)
            // AND if the LIS length ending at innerIndex is greater than the current best LIS length stored at optimalLink.
            if (  numericSeries[innerIndex]  <  numericSeries[outerIndex]  &&  lengthRecords[innerIndex]  >  lengthRecords[optimalLink]  )
            {
                optimalLink  = innerIndex; // Update optimalLink to this new, better predecessor.
            }
        }

        // The LIS length ending at outerIndex is one more than the LIS length ending at its optimal predecessor.
        lengthRecords[outerIndex] = lengthRecords[optimalLink] + 1;
        // predecessorIndices[outerIndex] = optimalLink; // Store the chosen predecessor's index.
    }

    // Determine the highest value present in the array of recorded subsequence lengths.
    var resultantMaximum = Math.max.apply(null, lengthRecords);
    // Display the final computed maximum length to the standard output.
    console.log(resultantMaximum);
}

var systemIO = require('fs'); // Obtain the Node.js file system module for input operations.
var rawData = systemIO.readFileSync('/dev/stdin', 'utf8'); // Read all content from standard input synchronously, using UTF-8.

var numericSeries = (rawData.trim()).split("\n").map(Number); // Clean the input, split into lines, and convert each line to a number.
ComputeMaxSubsequence(); // Invoke the primary function to calculate and print the result.