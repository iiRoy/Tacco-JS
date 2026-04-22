/*
 * This function processes a given input string to find specific patterns.
 * It calculates the number of matching pairs of sub-sequences and their reversed counterparts.
 */
function CalculateCombinations( rawInput )
{
  // Split the input into lines to extract parameters and the main sequence.
  const inputLines = rawInput.split( '\n' );

  // The first line contains the length of the sequence, converted to a number.
  let sequenceLength = +inputLines[ 0 ];

  // The second line contains the actual character sequence.
  const originalSequence = inputLines[ 1 ];

  // Create a reversed version of the sequence for comparison.
  const reversedSequence = originalSequence.split( '' ).reverse().join( '' );

  // Calculate the total number of combinations (2^sequenceLength).
  const totalIterations = 1 << sequenceLength;

  // Initialize two Maps to store counts of generated sub-sequence pairs.
  // Using Map provides a slight data type difference from plain objects.
  let firstSetCounts = new Map();
  let secondSetCounts = new Map();

  // Iterate through all possible combinations (from 0 to 2^n - 1).
  for ( let iterationIdx = 0; iterationIdx < totalIterations; iterationIdx++ )
  {
    // Initialize temporary strings for building sub-sequences.
    let currentPartA1 = ``;
    let currentPartA2 = ``;
    let currentPartB1 = ``;
    let currentPartB2 = ``;

    // Inner loop to build sub-sequences based on the current iteration index's bits.
    for ( let charPosition = 0; charPosition < sequenceLength; charPosition++ )
    {
      // Check the j-th bit of the current iteration index.
      // If the bit is set, add characters to the first parts (A1, B1).
      if ( iterationIdx & ( 1 << charPosition ) )
      {
        currentPartA1 += originalSequence[ charPosition ];
        currentPartB1 += reversedSequence[ charPosition ];
      }
      // Otherwise, add characters to the second parts (A2, B2).
      else
      {
        currentPartA2 += originalSequence[ charPosition ];
        currentPartB2 += reversedSequence[ charPosition ];
      }
    }

    // Combine the parts into unique keys for the Maps.
    const compositeKeyA = currentPartA1 + `,` + currentPartA2;
    const compositeKeyB = currentPartB1 + `,` + currentPartB2;

    // Increment counts for the generated keys in their respective Maps.
    firstSetCounts.set( compositeKeyA, ( firstSetCounts.get( compositeKeyA ) || 0 ) + 1 );
    secondSetCounts.set( compositeKeyB, ( secondSetCounts.get( compositeKeyB ) || 0 ) + 1 );
  }

  // Initialize a variable to accumulate the final result.
  let finalTally = 0;

  // Iterate through the keys in the first Map.
  for ( const [ keyA, countA ] of firstSetCounts.entries() )
  {
    // If the current key from the first Map does not exist in the second Map, skip it.
    if ( !secondSetCounts.has( keyA ) )
      continue;

    // If the key exists in both, multiply their counts and add to the total.
    finalTally += countA * secondSetCounts.get( keyA );
  }

  // Output the final calculated tally.
  console.log( finalTally );
}

// Read input from standard input and pass it to the processing function.
CalculateCombinations( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );