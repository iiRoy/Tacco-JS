// This function processes textual input to determine a specific condition.
function ExecuteLogic( rawText )
{
  // Split the entire input string by newline characters into an array of lines.
  let inputLines = rawText.split('\n');

  // Parse the first line to get the number of elements.
  const itemCount = parseInt( inputLines[0], 10 );

  // Initialize two arrays of the specified size, filled with zeros.
  let primaryValues = new Array(itemCount).fill(0);
  let secondaryValues = new Array(itemCount).fill(0);

  // Split the second line (index 1) into strings representing primary values.
  const strPrimaryValues = inputLines[1].split(' ');
  // Split the third line (index 2) into strings representing secondary values.
  const strSecondaryValues = inputLines[2].split(' ');

  // Initialize accumulators for sums and differences.
  let totalPrimary = 0;
  let totalSecondary = 0;
  let totalAbsDiff = 0;   // Sum of absolute differences |primary[idx] - secondary[idx]|
  let posDiffSum = 0;     // Sum of positive differences where secondary[idx] > primary[idx] (i.e., max(0, secondary[idx] - primary[idx]))
  let negDiffSum = 0;     // Sum of positive differences where primary[idx] > secondary[idx] (i.e., max(0, primary[idx] - secondary[idx]))

  // Iterate through the elements to populate arrays and calculate sums/differences.
  for ( let idx = 0; idx < itemCount; idx++ )
  {
    // Convert string to integer for primary array element.
    primaryValues[idx] = parseInt(strPrimaryValues[idx], 10);
    // Accumulate sum for primary values.
    totalPrimary += primaryValues[idx];

    // Convert string to integer for secondary array element.
    secondaryValues[idx] = parseInt(strSecondaryValues[idx], 10);
    // Accumulate sum for secondary values.
    totalSecondary += secondaryValues[idx];

    // Calculate and accumulate absolute difference.
    totalAbsDiff += Math.abs(primaryValues[idx] - secondaryValues[idx]);

    // Accumulate positive differences (secondary[idx] - primary[idx] when secondary[idx] > primary[idx]).
    posDiffSum += Math.max(0, secondaryValues[idx] - primaryValues[idx]);

    // Accumulate negative differences (primary[idx] - secondary[idx] when primary[idx] > secondary[idx]).
    negDiffSum += Math.max(0, primaryValues[idx] - secondaryValues[idx]);
  }

  // Initialize the final decision string.
  let finalVerdict = "No";

  // Evaluate a complex condition involving all calculated sums and differences.
  // The condition checks several inequalities and a ratio.
  if (totalPrimary <= totalSecondary &&
      totalAbsDiff <= ( totalSecondary - totalPrimary ) * 3 &&
      posDiffSum <= ( totalSecondary - totalPrimary ) * 2 &&
      negDiffSum <= ( totalSecondary - totalPrimary ) &&
      posDiffSum / negDiffSum <= 2)
  {
    finalVerdict = "Yes"; // If all conditions are met, set the verdict to "Yes".
  }

  // Output the final verdict to the console.
  console.log('%s', finalVerdict);
}

// Invoke the main processing function with data read from standard input.
ExecuteLogic( require("fs").readFileSync("/dev/stdin", "utf8") );