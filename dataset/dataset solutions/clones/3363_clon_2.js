function  processInputData (  rawData  )   {
  "use strict"; // Enforce strict parsing and error handling

  // Split the raw input string into individual text rows
  const   textRows   =   rawData.split ( "\n" ) ;

  // Parse the first line to extract initial parameters
  // It splits by space and converts each part to a number.
  const   initialParams   =   textRows[0] . split ( " " ) . map (  ( numericString )  =>  Number(numericString)  ) ;

  // Extract the circuit length from the initial parameters
  const   circuitLength   =   initialParams[0] ;

  // Extract the total number of points from the initial parameters
  const   numPoints   =   initialParams[1] ;

  // Process subsequent rows to get point positions
  // Filters out empty lines and converts remaining strings to numbers.
  let   pointPositions   =   textRows.slice(1) . filter (  ( item )  =>  item  ) . map (  ( item )  =>  parseInt(item, 10)  ) ;


  // Array to store calculated total costs for different paths
  let   totalCosts   =   [];

  // Recursive function to explore all possible paths and calculate their costs
  const   explorePaths   =   (  currentPos ,  remainingPoints ,  currentSum  )   =>   {
    // Base case: if no points are left, record the accumulated sum
    if   (  remainingPoints.length === 0  )   {
      totalCosts.push (  currentSum  ) ;
      return ;
    }

    // Calculate distance to the leftmost available point
    // Handles wrapping around the circuit if necessary
    const   distToLeftmost   =   remainingPoints[0]   >=   currentPos
      ?   remainingPoints[0] - currentPos
      :   ( circuitLength - currentPos ) + remainingPoints[0] ;

    // Calculate distance to the rightmost available point
    // Handles wrapping around the circuit if necessary
    const   distToRightmost   =   remainingPoints[remainingPoints.length - 1]   <=   currentPos
      ?   currentPos - remainingPoints[remainingPoints.length - 1]
      :   currentPos + ( circuitLength - remainingPoints[remainingPoints.length - 1] ) ;

    // Create a copy for the left path exploration
    const   leftBranchPoints   =   remainingPoints.concat (  ) ;
    // Get and remove the leftmost point for this path
    const   chosenLeftPoint   =   leftBranchPoints.shift (  ) ;

    // Create another copy for the right path exploration
    const   rightBranchPoints   =   remainingPoints.concat (  ) ;
    // Get and remove the rightmost point for this path
    const   chosenRightPoint   =   rightBranchPoints.pop (  ) ;

    // Recursively explore the path choosing the leftmost point next
    explorePaths (  chosenLeftPoint ,  leftBranchPoints ,  currentSum   +   distToLeftmost  ) ;
    // Recursively explore the path choosing the rightmost point next
    explorePaths (  chosenRightPoint ,  rightBranchPoints ,  currentSum   +   distToRightmost  ) ;
  }; // End of explorePaths function definition

  // Initiate the path exploration starting from position 0 with an initial sum of 0
  explorePaths (  0 ,  pointPositions ,  0  ) ;

  // Output the maximum cost found among all explored paths
  console . log (  Math.max (  ...totalCosts  )  ) ;
}

// Read input from standard input and pass it to the processing function
processInputData (  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )  ) ;