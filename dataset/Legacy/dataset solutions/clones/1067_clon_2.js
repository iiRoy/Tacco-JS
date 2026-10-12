function executeSortingRoutine (  sourceArray  ,   targetArray  ,   maxValue  ) {
  // This array will store the frequency or cumulative count of elements.
  var   countRegister  =   [   ]  ;

  // Initialize the count register with zeros up to the maximum value.
  for (  var   idx1   =   0  ;   idx1   <=   maxValue  ;   idx1  ++   )
  {
    countRegister  [   idx1   ]   =   0  ;
  }

  // Populate the count register by iterating through the source array.
  // Note: The loop condition 'idx2 <= sourceArray.length' might cause an out-of-bounds access
  // for the last iteration if not handled carefully in the original logic.
  for (  var   idx2   =   0  ;   idx2   <=   sourceArray  .  length  ;   idx2  ++   )
  {
    countRegister  [   sourceArray  [   idx2   ]   ]  ++  ;
  }

  // Transform the count register into cumulative counts.
  // This helps in determining the final sorted positions.
  for (  var   idx1   =   1  ;   idx1   <=   maxValue  ;   idx1  ++   )
  {
    countRegister  [   idx1   ]   +=   countRegister  [   idx1   -   1   ]  ;
  }

  // Build the sorted array by iterating through the source array in reverse.
  for (  var   idx2   =   sourceArray  .  length   -   1  ;   idx2   >=   0  ;   idx2  --   )
  {
    targetArray  [   countRegister  [   sourceArray  [   idx2   ]   ]   -   1   ]   =   sourceArray  [   idx2   ]  ;
    // Decrement the count for the current element to place duplicates correctly.
    countRegister  [   sourceArray  [   idx2   ]   ]  --  ;
  }
}


var   rawData   =   require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,   'utf8'  )  ;
var   dataLines   =   rawData  .  split  (  '\n'  )  ;

// Read the first line which typically indicates the number of elements.
var   elementCount   =   +  dataLines  .  shift  (  )  ;
// Read the second line, split by spaces, and convert each part to a number.
var   initialArray   =   dataLines  .  shift  (  )  .  split  (  ' '  )  .  map  (  function  (  currentVal  )
{
  return   +  currentVal  ;
}  )  ;

// Create an empty array to store the sorted results.
var   resultArray   =   [   ]  ;

// Invoke the custom sorting routine with the input array, output array, and maximum expected value.
executeSortingRoutine  (   initialArray  ,   resultArray  ,   10000   )  ;

// Print the sorted elements joined by spaces to standard output.
console  .  log  (  resultArray  .  join  (  ' '  )  )  ;