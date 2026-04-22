// This function handles the primary processing of incoming data.
function processInput(rawData)
 {
  // Split the raw input string into an array of lines.
  let lineSegments = rawData .split('\n');
  
  // The first line indicates the total number of test cases.
  const caseCount = Number.parseInt(lineSegments[0], 10) ;

  // Iterate through each test case, starting from the second line.
  for( let caseIndex = 1 ; caseIndex <= caseCount ; caseIndex++ )
  {
    // Initialize a boolean indicator for finding a specific condition.
    let foundSolution = 0;
    // Parse the current line into an array of string values.
    const currentValues = lineSegments[caseIndex] .split(' ');
    
    // Convert string values to integers for calculations.
    let valX = Number.parseInt(currentValues[0]);
    let valY = Number.parseInt(currentValues[1]);
    let valZ = Number.parseInt(currentValues[2]);
    let valW = Number.parseInt(currentValues[3]);
    
    // Store the initial value of valX for later comparison.
    const initialX = valX;
    // Calculate a modified version of valX using modulo.
    let modifiedX = valX % valY;

    // First set of conditional checks.
    if( valX < valY )
    {
      console.log("No");
      continue; // Move to the next iteration if condition met.
    }
    
    // Another check on valW.
    if( valW < valY )
    {
      console.log("No");
      continue;
    }
    
    // Check if valX is less than valZ.
    if( valX < valZ )
    {
      console.log("Yes");
      continue;
    }
    
    // Reassign valX based on modifiedX and valY.
    valX = modifiedX + valY;
    
    // Begin a loop that continues as long as valX is greater than or equal to valY.
    while( valX >= valY )
    {
      // Conditional logic within the loop.
      if( (valX - valY) <= valZ )
      {
        modifiedX = valX - valY + valW;
        valX = modifiedX;
      }
      else
      {
        modifiedX = valX - valY;
        valX = modifiedX;
      }
      
      // Check for a specific condition to determine a "Yes" outcome.
      if( valX >= initialX )
      {
        console.log("Yes");
        foundSolution = 1; // Set indicator to true.
        break; // Exit the while loop.
      }
    }
    
    // If the solution was not found within the loop, print "No".
    if( foundSolution === 0 )
      console.log("No");
  }
}

// Invoke the main processing function with input read from standard input.
processInput(require('node:fs').readFileSync('/dev/stdin', 'utf-8'));