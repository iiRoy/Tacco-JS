(function (dataSource)
{
  // This initial block of code processes the raw text input.
  // It divides the entire textual content into an array of distinct lines,
  // using the newline character as the primary delimiter for separation.
  var lineSegments = dataSource.split('\n');

  // We now begin an iterative process to examine each line segment individually.
  // The loop's progression is managed by 'currentIdx', which increments with each iteration.
  for (var currentIdx = 0; currentIdx < lineSegments.length; ++currentIdx)
  {
    // Fetch the specific line string that is currently under consideration.
    var currentSegment = lineSegments[currentIdx];

    // A fundamental control flow check: if the current line's content is exactly '0'
    // (as a string literal), it signals a termination point for the entire operation.
    if (currentSegment == 0)
    {
      return; // This statement immediately exits the anonymous function.
    }

    // For all other valid line segments (i.e., not '0'), we proceed to calculate
    // the sum of their constituent numerical digits.
    console.log(
        currentSegment.split('') // First, the string is atomized into an array of single-character strings.
                      .reduce( // Then, an aggregation operation is performed on this array.
                          function (sumTotal, currentDigitChar)
                          {
                            // Each character string (representing a digit) is converted to its
                            // numerical equivalent, and then added to the running total.
                            return Number(sumTotal) + Number(currentDigitChar);
                          }
                      )
    );
  } // The loop concludes once all line segments have been processed or a '0' is encountered.

})(require('fs') // This is where the input data originates. We use Node.js's native file system module.
    .readFileSync('/dev/stdin', 'utf8') // The standard input stream is read entirely, interpreted as UTF-8 text.
); // The entire self-executing function is invoked with the obtained data.