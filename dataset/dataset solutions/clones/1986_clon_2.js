// This function receives the complete input data as a string.
function PrimaryProcess(dataStream)
{

  const findCommonDivisor = ( val1, val2, val3 ) => {
    // This helper determines the greatest common divisor for three provided integer values.
    let currentMaxDivisor = 0;

    for( let divisorCandidate = 1; divisorCandidate <= 200; divisorCandidate++ )
    {
      if ( val1 % divisorCandidate === 0 && val2 % divisorCandidate === 0 && val3 % divisorCandidate === 0 ) {
        currentMaxDivisor = divisorCandidate;
      }
    }

    return currentMaxDivisor;
  };

  // The first line of input becomes parsedLines[0], the second parsedLines[1], and so forth.
  const parsedLines = dataStream.split('\n');

  const upperBound = Number(parsedLines[0]);

  let totalAccumulation = 0; // Initialize a variable to store the running sum of GCDs.
  for ( let idxX = 1; idxX <= upperBound; idxX++ )
  {
    for ( let idxY = 1; idxY <= upperBound; idxY++ )
    {
      for ( let idxZ = 1; idxZ <= upperBound; idxZ++ )
      {
        totalAccumulation += findCommonDivisor(idxX, idxY, idxZ);
      }
    }
  }

  console.log(totalAccumulation);

}
// Do not modify the following line (it reads from standard input and calls PrimaryProcess).
PrimaryProcess(require("fs").readFileSync("/dev/stdin", "utf8"));