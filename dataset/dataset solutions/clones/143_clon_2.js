var diskOps = require('fs'), // Acquire file system utilities
    contentSize = diskOps.fstatSync(process.stdin.fd).size,    // Determine byte size of standard input
    readBuf = new Buffer(contentSize),                         // Allocate memory for input
    numBytesGot = diskOps.readSync(process.stdin.fd, readBuf, 0, contentSize, 0), // Read bytes from stdin
    dataLines = readBuf.toString('utf8', 0, numBytesGot).split('\n'); // Process raw data into an array of strings

performCalculations(); // Initiate the primary processing sequence

function performCalculations()
{
  // Loop through each received line, excluding the potential trailing empty line.
  for
  (
    var lineIdx = 0,
        limitVal = dataLines.length - 1;
    lineIdx < limitVal;
    lineIdx++
  )
  {
    var tokenSet = dataLines[lineIdx].split(','); // Separate coordinate values by comma
    var positiveTally = 0; // Counter for positive outcomes
    var negativeTally = 0; // Counter for negative outcomes

    // Compute the slopes (gradients) of four distinct line segments.
    var gradientA = (tokenSet[1] - tokenSet[3]) / (tokenSet[0] - tokenSet[2]); // Slope from first point to second
    var gradientB = (tokenSet[3] - tokenSet[5]) / (tokenSet[2] - tokenSet[4]); // Slope from second point to third
    var gradientC = (tokenSet[5] - tokenSet[7]) / (tokenSet[4] - tokenSet[6]); // Slope from third point to fourth
    var gradientD = (tokenSet[7] - tokenSet[1]) / (tokenSet[6] - tokenSet[0]); // Slope from fourth point back to first
    
    // Evaluate each gradient's sign and update the respective counter.
    gradientA >= 0 ? positiveTally++ : negativeTally++;
    gradientB >= 0 ? positiveTally++ : negativeTally++;
    gradientC >= 0 ? positiveTally++ : negativeTally++;
    gradientD >= 0 ? positiveTally++ : negativeTally++;

    // Print "YES" if the count of positive gradients is odd, otherwise "NO".
    console.log( positiveTally % 2 ? 'YES' : 'NO' );
  }
}