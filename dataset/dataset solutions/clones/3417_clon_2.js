function ProcessInputData ( rawDataString )
{
  // Divide the entire input string by newline characters to obtain an array of individual lines.
  rawDataString = rawDataString.split ( '\n' ) ;

  // Extract and parse the two numerical parameters from the very first line of the input.
  // These values define the recursive depth of the burger structure and the specific position to evaluate.
  const burgerDepthLevel = Number.parseInt ( rawDataString [ 0 ] . split ( ' ' ) [ 0 ] ) ;
  let targetBurgerPosition = Number.parseInt ( rawDataString [ 0 ] . split ( ' ' ) [ 1 ] ) ;

  // Declare and initialize two arrays for storing pre-calculated counts.
  // `pattyLayerCounts` will hold the number of patties for each burger level.
  // `overallComponentCounts` will store the total number of components (buns + patties) for each level.
  // Note: JavaScript arrays dynamically expand, so `new Array(50)` will handle index 50 access.
  const pattyLayerCounts = new Array ( 50 ) ;
  const overallComponentCounts = new Array ( 50 ) ;

  // Establish the foundational counts for a level 0 burger.
  // A level 0 burger is defined as having one patty and one total component.
  pattyLayerCounts [ 0 ] = 1 ;
  overallComponentCounts [ 0 ] = 1 ;

  // Initialize a variable to accumulate the total number of patties found up to the target position.
  let totalPattiesAccumulator = 0 ;

  // Loop to pre-compute the patty and total component counts for all levels from 1 to 50.
  for ( let currentStructureLevel = 1 ; currentStructureLevel <= 50 ; currentStructureLevel ++ )
  {
    // The number of patties at the current level is twice the patties of the previous level, plus one (for the central patty).
    pattyLayerCounts [ currentStructureLevel ] = pattyLayerCounts [ currentStructureLevel - 1 ] * 2 + 1 ;
    // The total components at the current level is twice the components of the previous level, plus three (for two outer buns and the central patty).
    overallComponentCounts [ currentStructureLevel ] = overallComponentCounts [ currentStructureLevel - 1 ] * 2 + 3 ;
  }

  // Retrieve the maximum total components and patties corresponding to the specified burger depth.
  let currentMaxComponents = overallComponentCounts [ burgerDepthLevel ] ;
  let currentMaxPatties = pattyLayerCounts [ burgerDepthLevel ] ;

  // A boolean-like flag to track if the target position was initially beyond the burger's total length,
  // indicating that the counting should be effectively reversed.
  let isPositionInverted = 0 ;

  // Check if the provided target position exceeds the total components of the burger at its depth.
  if ( targetBurgerPosition > currentMaxComponents )
  {
    // If it does, recalculate the target position by effectively counting from the opposite end.
    targetBurgerPosition = currentMaxComponents - targetBurgerPosition ;
    // Set the flag to signify that the position has been inverted.
    isPositionInverted = 1 ;
  }

  // Traverse the burger structure segment by segment until the target position is reached or surpassed.
  while ( targetBurgerPosition > 0 )
  {
    // Determine if the target position lies within the upper segment of the current burger section.
    if ( targetBurgerPosition > ( currentMaxComponents - 1 ) / 2 )
    {
      // If in the upper segment, adjust the target position by subtracting the lower bun, all lower patties, and the central patty.
      targetBurgerPosition = targetBurgerPosition - ( currentMaxComponents - 1 ) / 2 - 1 ;
      // Add the patties from the lower segment and the central patty to the running total.
      totalPattiesAccumulator = totalPattiesAccumulator + ( currentMaxPatties - 1 ) / 2 + 1 ;
      // Reduce the current segment's component and patty counts to reflect the remaining part of the burger.
      currentMaxComponents = ( currentMaxComponents - 1 ) / 2 - 1 ;
      currentMaxPatties = ( currentMaxPatties - 1 ) / 2 ;
    }
    else
    {
      // If the target position is in the lower segment, simply move past a bun.
      // No patties are counted in this specific step.
      targetBurgerPosition = targetBurgerPosition - 1 ;
      // Reduce the current segment's component and patty counts for the next iteration.
      currentMaxComponents = ( currentMaxComponents - 1 ) / 2 - 1 ;
      currentMaxPatties = ( currentMaxPatties - 1 ) / 2 ;
    }
  }

  // After the traversal, if the position was initially marked as inverted, adjust the final patty count.
  // Note: The original code used an assignment operator (`=`) in this `if` condition,
  // which means `isPositionInverted` is set to `1` and the condition evaluates as truthy,
  // causing this block to always execute. This behavior is precisely replicated.
  if ( isPositionInverted = 1 )
  {
    totalPattiesAccumulator = pattyLayerCounts [ burgerDepthLevel ] - totalPattiesAccumulator ;
  }

  // Output the final calculated patty count to the standard console.
  console.log ( 'Final Patty Tally: %s' , totalPattiesAccumulator ) ;
}


// This auxiliary function is provided for debugging purposes, primarily in a web browser context.
function ExecuteTestScenario ( )
{
  // Retrieve the string value from an HTML input element identified by 'user_input_field'.
  const webPageInputVal = document.getElementById ( 'user_input_field' ) . value ;
  // Pass the collected input string to the main processing function for execution.
  ProcessInputData ( webPageInputVal ) ;
}

// This line serves as the primary entry point for script execution in a Node.js environment.
// It reads input from standard input (`/dev/stdin`), interprets it as UTF-8, and passes it to the main function.
ProcessInputData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;