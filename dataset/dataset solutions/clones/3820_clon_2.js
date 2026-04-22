/* This function orchestrates the entire calculation process */
function ComputeFinalValue(  initialTextData  )
{
  // First, parse the raw input text.
  // It splits the string by newline characters and converts each part into a number.
  let numericalSequence = initialTextData
                            .split(  "\n"  )
                            .map(  singleItem =>  +singleItem  );

  // The first element of the sequence often represents a count or an upper bound.
  const seriesUpperBound = numericalSequence[0];

  // Initialize a variable to accumulate the result.
  let accumulatedOutcome = 0;

  // Iterate backwards through the numerical sequence, starting from the upper bound
  // and continuing until the second element (index 1).
  for (  let currentPosition = seriesUpperBound;
         currentPosition > 1;
         currentPosition--  )
  {
    /* Check for an invalid condition: if the value at the current position
       is greater than or equal to the position itself, the problem is unsolvable. */
    if (  numericalSequence[currentPosition]  >=  currentPosition  )
    {
      console.log( -1  ); // Output the error indicator.
      return; // Terminate execution immediately.
    }

    // Determine how to update the accumulated outcome based on a specific pattern.
    if (  numericalSequence[currentPosition]  ===
          numericalSequence[currentPosition - 1]  +  1  )
    {
      // If the current element follows the previous one in sequence, increment the outcome.
      accumulatedOutcome++;
    }
    else
    {
      // Otherwise, add the current element's value directly to the outcome.
      accumulatedOutcome += numericalSequence[currentPosition];
    }
  }

  // Display the final computed outcome.
  console.log(  accumulatedOutcome  );
}

// Read the input synchronously from standard input using Node.js filesystem module.
// Then, invoke the main computation function with the obtained string data.
ComputeFinalValue(require("fs") . readFileSync( "/dev/stdin" ,  "utf8"  ) );