// This function serves as the primary entry point for processing input data.
function ProcessInput( inputData ) {
  // First, split the entire input string into an array of individual lines.
  let  dataLines = inputData . split ( "\n" ) ;

  // Extract and parse the first two crucial numbers from the initial line.
  const  totalElements = parseInt ( dataLines [ 0 ] . split ( " " ) [ 0 ] ) ;
  const  maxRange = parseInt ( dataLines [ 0 ] . split ( " " ) [ 1 ] ) ;

  // Initialize two arrays to store the positional coordinates and their corresponding values.
  let  positions = new Array ( totalElements ) ;
  let  values = new Array ( totalElements ) ;

  // A marker variable to identify a specific index based on a midpoint condition.
  let  midwayPoint = 0 ;

  // Loop through each subsequent line of input to populate the positions and values arrays.
  for ( let  iterA = 0 ; iterA < totalElements ; iterA ++ ) {
    // Temporarily split the current line to extract the two numbers.
    let  currentParts = dataLines [ iterA + 1 ] . split ( " " ) ;
    positions [ iterA ] = parseInt ( currentParts [ 0 ] ) ; // Store the position.
    // Check if the current position is less than half the total range.
    if ( positions [ iterA ] < maxRange / 2 ) {
      midwayPoint = iterA ; // Update the midway point index.
    }
    values [ iterA ] = parseInt ( currentParts [ 1 ] ) ; // Store the value.
  }

  // Initialize the variable to hold the maximum score found.
  let  maximumScore = 0 ;
  // Initialize a variable for accumulating sums during calculations.
  let  currentAccumulation = 0 ;

  // First calculation phase: Traverse from left to right.
  for ( let  iterA = 0 ; iterA < totalElements ; iterA ++ ) {
    if ( iterA === 0 ) {
      // For the very first item, calculate sum as value minus its position.
      currentAccumulation = currentAccumulation + values [ iterA ] - positions [ iterA ] ;
    } else {
      // For subsequent items, add value and subtract the distance from the previous item.
      currentAccumulation = currentAccumulation + values [ iterA ] - ( positions [ iterA ] - positions [ iterA - 1 ] ) ;
    }
    // Update the maximum score if the current accumulation is higher.
    maximumScore = Math . max ( maximumScore , currentAccumulation ) ;
  }

  // Second calculation phase: Explore scenarios moving backward from the midway point.
  for ( let  iterA = midwayPoint ; iterA >= 0 ; iterA -- ) {
    currentAccumulation = 0 ; // Reset accumulation for each outer loop iteration.
    // Inner loop: Calculate sum from the start up to the current iterA.
    for ( let  iterB = 0 ; iterB <= iterA ; iterB ++ ) {
      if ( iterB === 0 ) {
        currentAccumulation = currentAccumulation + values [ iterB ] - positions [ iterB ] ;
      } else {
        currentAccumulation = currentAccumulation + values [ iterB ] - ( positions [ iterB ] - positions [ iterB - 1 ] ) ;
      }
      maximumScore = Math . max ( maximumScore , currentAccumulation ) ; // Update global maximum.
    }
    // After calculating the forward path, subtract the cost of returning to the start.
    currentAccumulation = currentAccumulation - positions [ iterA ] ;

    // Inner loop: Calculate sum for remaining items from the end, moving towards iterA + 1.
    for ( let  iterB = totalElements - 1 ; iterB > iterA ; iterB -- ) {
      if ( iterB === totalElements - 1 ) {
        // For the last item, consider the full distance from the end of the range.
        currentAccumulation = currentAccumulation - ( maxRange - positions [ iterB ] ) + values [ iterB ] ;
      } else {
        // For other items, subtract distance from the next item.
        currentAccumulation = currentAccumulation - ( positions [ iterB + 1 ] - positions [ iterB ] ) + values [ iterB ] ;
      }
      maximumScore = Math . max ( maximumScore , currentAccumulation ) ; // Update global maximum.
    }
  }

  // Third calculation phase: Explore scenarios moving forward from midwayPoint + 1.
  for ( let  iterA = midwayPoint + 1 ; iterA < totalElements ; iterA ++ ) {
    currentAccumulation = 0 ; // Reset accumulation.
    // Inner loop: Calculate sum from the end down to the current iterA.
    for ( let  iterB = totalElements - 1 ; iterB >= iterA ; iterB -- ) {
      if ( iterB === totalElements - 1 ) {
        currentAccumulation = currentAccumulation + values [ iterB ] - ( maxRange - positions [ iterB ] ) ;
      } else {
        currentAccumulation = currentAccumulation - ( positions [ iterB + 1 ] - positions [ iterB ] ) + values [ iterB ] ;
      }
      maximumScore = Math . max ( maximumScore , currentAccumulation ) ; // Update global maximum.
    }
    // After calculating the backward path, subtract the cost of returning to the end.
    currentAccumulation = currentAccumulation - ( maxRange - positions [ iterA ] ) ;

    // Inner loop: Calculate sum for remaining items from the beginning, up to iterA - 1.
    for ( let  iterB = 0 ; iterB < iterA ; iterB ++ ) {
      if ( iterB === 0 ) {
        currentAccumulation = currentAccumulation + values [ iterB ] - positions [ iterB ] ;
      } else {
        currentAccumulation = currentAccumulation + values [ iterB ] - ( positions [ iterB ] - positions [ iterB - 1 ] ) ;
      }
      maximumScore = Math . max ( maximumScore , currentAccumulation ) ; // Update global maximum.
    }
  }

  // Display the final computed maximum score.
  console . log ( '%s' , maximumScore ) ;
}

// This utility function is provided for debugging purposes, typically in a browser environment.
function ExecuteDebug ( ) {
  // Retrieve the text content from a specific HTML input field.
  const  inputContent = document . getElementById ( "input" ) . value ;
  ProcessInput ( inputContent ) ; // Pass the retrieved content to the main processing function.
}

// Initiate the main processing logic by reading data from standard input.
ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;