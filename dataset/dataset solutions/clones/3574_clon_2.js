/*
 * This script processes an input string to find specific numeric combinations.
 * The primary goal is to identify triplets (a, b, c) that satisfy certain modular arithmetic conditions.
 */
function ProcessInput( inputString ) {

  // Split the raw input string into its constituent numeric components.
  const dataParts = inputString.split(' ');

  // Parse the first component as the upper limit for the numbers in the triplet.
  const maxValue = parseInt(dataParts[0]);

  // Parse the second component as the divisor for the modular checks.
  const divisionFactor = parseInt(dataParts[1]);


  // Initialize an array to store all valid three-number sequences found.
  var foundTriplets = [       ] ;


  // Outer loop: iterates for the first element of the triplet.
  for (  let firstNum = 1;   firstNum <= maxValue;   firstNum++ )
  {
    // Initialize a temporary array to hold the current three-number sequence.
    var currentSequence = [ ];
    currentSequence[0] = firstNum;

    // Middle loop: iterates for the second element of the triplet.
    for (   let secondNum = 1;   secondNum <= maxValue;   secondNum++   )
    {
      currentSequence[1] = secondNum;

      // Inner loop: iterates for the third element of the triplet.
      for (   let thirdNum = 1;   thirdNum <= maxValue;   thirdNum++   )
      {
        currentSequence[2] = thirdNum;

        // Check if the current triplet satisfies all modular conditions.
        // Conditions are: (first + second) % factor == 0
        //                 (second + third) % factor == 0
        //                 (third + first) % factor == 0
        if (   ( (currentSequence[0] + currentSequence[1]) % divisionFactor === 0 )
          && ( (currentSequence[1] + currentSequence[2]) % divisionFactor === 0 )
          && ( (currentSequence[2] + currentSequence[0]) % divisionFactor === 0 )   )
        {
          // If all conditions are met, add this sequence to our collection of valid triplets.
          foundTriplets.push(currentSequence);
        }
      }
    }
  }

  // Output the total count of valid three-number sequences found.
  console.log( foundTriplets.length );
}

// This section handles standard input/output and should not be modified.
ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") );