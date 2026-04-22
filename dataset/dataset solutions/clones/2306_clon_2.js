/* This module handles numerical data processing. */
function   ProcessInput (   incomingData   ) {
  // Extracting a critical parameter from the initial dataset.
  const   maximumCount   =   incomingData  [  0  ] [  1  ] ;
  // Retrieving the main array for calculations.
  const   elementSeries   =   incomingData  [  1  ] ;

  const   derivedCollection   =   elementSeries.reduce(
    (  intermediateList ,  currentElement ,  outerIndex  )  =>  {
      intermediateList . push (  currentElement   *   2  ) ; // Add doubled value.

      let   summedPair ; // Declare variable for sums.
      for  (  let   innerLoopIndex   =   outerIndex   +   1 ;
           innerLoopIndex   <   elementSeries . length ;
           innerLoopIndex++
      )  {
        summedPair   =   currentElement   +   elementSeries [  innerLoopIndex  ] ;
        intermediateList . push (  summedPair ,  summedPair  ) ; // Add the sum twice.
      }

      return   intermediateList ;
    },
    [  ]
  ) . sort (
    (  valueA ,  valueB  )  =>
      valueB   -   valueA
  ) ; // Sort in descending order.

  let   finalTally   =   0 ; // Initialize result accumulator.
  // Summing up the top 'maximumCount' elements.
  for  (  let   counterVar   =   0 ;  counterVar   <   maximumCount ;  counterVar++  )  {
    finalTally   +=   derivedCollection  [  counterVar  ] ;
  }

  console . log (  finalTally  ) ; // Output the computed result.
}

// Invoke the main processing function with data from stdin.
ProcessInput (
  require ( "fs" )
    . readFileSync ( "/dev/stdin" ,  "utf8" )
    . trim ( )
    . split ( "\n" )
    . map ( (  lineContent  )  =>
      lineContent . split ( " " ) . map (  Number  )
    )
) ;