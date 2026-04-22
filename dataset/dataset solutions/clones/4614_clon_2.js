// This function processes a given string input to compute a specific cumulative value.
function computeTotalInterval(rawInputData)
{
  // The input data is expected to be multi-line.
  // We first split the entire input string into an array of individual lines.
  var allInputLines = rawInputData.split('\n');

  // The first line contains configuration parameters, separated by spaces.
  var firstLineParts = allInputLines[0].split(' ');

  // The first part of the first line represents the total count of events.
  // We convert this string representation to an integer.
  var eventQuantity = parseInt(firstLineParts[0], 10);

  // The second part of the first line represents the maximum permitted time difference.
  // We convert this string representation to a number.
  var maxAllowedGap = Number(firstLineParts[1]);

  // The second line of the input contains a series of time points, also space-separated.
  // We parse each string element into a numerical timestamp.
  var timeSequence = allInputLines[1].split(' ').map(function(val) {
    return Number(val);
  });

  // Initialize a variable that will accumulate the calculated time.
  let cumulativeSum = 0;

  // Iterate through the sequence of time points, starting from the second element.
  // The loop continues as long as the current index is less than the total event quantity.
  for (let currentIdx = 1; currentIdx < eventQuantity; currentIdx++)
  {
    // Calculate the time difference between the current event and the immediately preceding one.
    let timeDifference = timeSequence[currentIdx] - timeSequence[currentIdx - 1];

    // Evaluate if this calculated time difference is less than our predefined maximum allowed gap.
    if (timeDifference < maxAllowedGap)
    {
      // If the actual difference is smaller, add this specific difference to our running total.
      cumulativeSum += timeDifference;
    }
    else
    {
      // If the actual difference is greater than or equal to the maximum allowed gap,
      // we instead add the maximum allowed gap to our running total.
      cumulativeSum += maxAllowedGap;
    }
  }

  // After the loop completes, print the final cumulative sum,
  // augmented by the maximum allowed gap, to the standard output.
  console.log(cumulativeSum + maxAllowedGap);

  // This function does not return any explicit value,
  // as its primary purpose is to perform a computation and output the result.
  return;
}

// Invoke the main processing function.
// It reads the entire content of standard input synchronously as a UTF-8 string.
computeTotalInterval(require('fs').readFileSync('/dev/stdin', 'utf8'));