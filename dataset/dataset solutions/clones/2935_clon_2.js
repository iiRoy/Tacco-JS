// This program is designed to analyze and determine the intersection length of multiple numerical ranges.
function    ProcessIntervals  (   incomingFeed    )   {
        // First, segment the entire input string into individual lines.
    const   parsedLines     =   incomingFeed.split(  "\n"  )   ;

        // The initial line contains fundamental configuration parameters.
    let     firstLineData   =   parsedLines[   0   ].split(  " "  )   ;
    const   firstNumericValue   =   parseInt(   firstLineData[   0   ]   )   ;   // Represents a primary data point.
    const   totalRangeCount     =   parseInt(   firstLineData[   1   ]   )   ;   // Defines the number of interval pairs to process.

        // Initialize dynamic arrays to store the starting and ending points of each range.
    const   startPoints     =   new Array(  totalRangeCount  )   ;
    const   endPoints       =   new Array(  totalRangeCount  )   ;

        // Iterate through the subsequent lines to populate the range arrays.
    for     (   let lineIterator    =   1   ;   lineIterator    <=  totalRangeCount ;   lineIterator++  )   {
        let     currentRangeTokens  =   parsedLines[   lineIterator   ].split(  " "  )   ;
        startPoints[   lineIterator - 1   ]   =   parseInt(   currentRangeTokens[   0   ]   )   ;   // Convert string to integer for starting boundary.
        endPoints[     lineIterator - 1   ]   =   parseInt(   currentRangeTokens[   1   ]   )   ;   // Convert string to integer for ending boundary.
    }

        // Establish initial values for tracking the overall tightest interval.
    let     overallMaximumStart     =   startPoints[   0   ]   ;
    let     overallMinimumEnd       =   endPoints[     0   ]   ;

        // Traverse the collection of start points to identify the highest starting boundary.
    startPoints.forEach(  (  currentStartVal  ,  positionIndex  )   =>  {
        if      (   currentStartVal     >   overallMaximumStart     )   {
            overallMaximumStart     =   currentStartVal     ;
        }
    }   )   ;

        // Examine the collection of end points to determine the lowest ending boundary.
    endPoints.forEach(  (  currentEndVal  ,  positionIndex  )   =>  {
        if      (   currentEndVal   <   overallMinimumEnd   )   {
            overallMinimumEnd   =   currentEndVal   ;
        }
    }   )   ;

        // Compute the length of the intersection of all ranges.
    const   calculatedOverlap       =   overallMinimumEnd   -   overallMaximumStart     +   1   ;

        // Output the calculated overlap length. If no positive overlap exists, print zero.
    if      (   calculatedOverlap   >   0   )   {
        console.log   (   calculatedOverlap   )   ;
    }   else    {
        console.log   (   0   )   ;
    }

}

// Execute the interval processing function by reading input from the standard input stream.
ProcessIntervals(
    require(  "fs"  ).readFileSync(
        "/dev/stdin",
        "utf8"
    )
);