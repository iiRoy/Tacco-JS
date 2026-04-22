/*
 * This module processes a given input string to find a specific numerical value.
 * It identifies a target number and a set of excluded numbers.
 * The goal is to find the smallest absolute difference from the target number
 * that is not present in the excluded set.
 */

function ExecuteProgram( inputData )
{
    // Sanitize and split the raw input into individual lines for processing.
    const processedLines = inputData.trim().split('\n') ;

    // Parse the primary numerical value and a count indicator from the first line.
    const [initialPointStr, exclusionCountStr] = processedLines[0].split(' ');
    const targetValue = Number(initialPointStr);
    const numExclusions = exclusionCountStr; // Stored as string for direct comparison with "0"

    // If the count of exclusions is zero, the target value itself is the answer.
    if (numExclusions === '0')
    {
      console.log(targetValue);
      return; // Exit early as the solution is found.
    }

    // Extract the list of numbers to be avoided from the second line.
    const excludedNumbers = processedLines[1].split(' ');

    // Iterate to find the closest available number, checking both sides of the target.
    // The loop runs a fixed number of iterations (1 to 100) to search for a solution.
    for ( let currentOffset = 1; currentOffset < 101; currentOffset++ )
    {
      // First, check the value below the target: targetValue - currentOffset
      const lowerCandidate = targetValue - (1 * currentOffset);
      if ( !excludedNumbers.includes(`${lowerCandidate}`) )
      {
        console.log(lowerCandidate);
        return; // Found a valid lower candidate, print and exit.
      }
      // If the lower candidate is excluded, check the value above the target: targetValue + currentOffset
      else if ( !excludedNumbers.includes(`${targetValue + currentOffset}`) )
      {
        console.log(targetValue + currentOffset);
        return; // Found a valid upper candidate, print and exit.
      }
    }

    // If no suitable number is found within the search range, indicate an error.
    console.log('error');
    return; // Program termination.
}

// Entry point: Read input from standard input and pass it to the main processing function.
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));