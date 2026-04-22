/*
 * This script processes a string of numerical input
 * to perform a series of distance calculations.
 */
function  executeCalculations (  dataString  )
{
  // Split the input string into individual numerical tokens.
  const  tokens  =  dataString.split( ' ' ) ;

  /*
   * Convert string tokens to numbers and assign them to
   * key variables for further computation.
   */
  const  upperBound  =  Number(tokens[0]) ;
  const  firstCoord  =  Number(tokens[1]) ;
  const  secondCoord  =  Number(tokens[2]) ;

  /**
   * Computes the effective path length between two points.
   * It considers a direct path and an alternative path via reference coordinates.
   * @param {number} startPoint - The initial point.
   * @param {number} endPoint - The terminal point.
   * @returns {number} The minimum calculated path length.
   */
  function  measureGap (  startPoint ,  endPoint  )
  {
    return  Math.min(
      endPoint  -  startPoint ,
      Math.abs(firstCoord  -  startPoint)  +  Math.abs(secondCoord  -  endPoint)  +  1
    ) ;
  }

  // Iterate through potential interval lengths.
  for ( var  intervalLength = 1 ;  intervalLength < upperBound ;  intervalLength++  )
  {
    let  matchTally = 0 ; // Initialize counter for current interval length.

    // Iterate through all possible starting points for the current interval length.
    for ( var  beginPoint = 1 ;  beginPoint <= upperBound  -  intervalLength ;  beginPoint++  )
    {
      const  segmentEnd  =  beginPoint  +  intervalLength ; // Calculate the natural end point.

      // Check if the natural segment end is within bounds and matches the current interval length.
      if ( segmentEnd <= upperBound  &&  measureGap(beginPoint , segmentEnd)  ===  intervalLength )
      {
        matchTally++ ; // Increment count if condition met.
      }

      /*
       * Calculate the remaining distance for alternative paths,
       * considering the first coordinate.
       */
      const  deltaVal  =  intervalLength  -  1  -  Math.abs(firstCoord  -  beginPoint) ;

      // If there's a positive remaining distance, explore two candidates.
      if (  deltaVal  >  0  )
      {
        // Candidate 1: Previous point based on remaining distance.
        const  lowerBoundCand  =  secondCoord  -  deltaVal ;
        if (  lowerBoundCand  !==  segmentEnd  &&  measureGap(beginPoint , lowerBoundCand)  ===  intervalLength  )
        {
          matchTally++ ;
        }

        // Candidate 2: Next point based on remaining distance.
        const  upperBoundCand  =  secondCoord  +  deltaVal ;
        if (  upperBoundCand  !==  segmentEnd  &&  upperBoundCand  <=  upperBound  &&  measureGap(beginPoint , upperBoundCand)  ===  intervalLength  )
        {
          matchTally++ ;
        }
      }
      // If remaining distance is zero, check only the second coordinate directly.
      else  if (  deltaVal  ===  0  &&  secondCoord  !==  segmentEnd  &&  measureGap(beginPoint , secondCoord)  ===  intervalLength  )
      {
        matchTally++ ;
      }
    }

    // Output the total matches for the current interval length.
    console.log(matchTally) ;
  }
}

// Entry point: Read input from standard input and initiate processing.
executeCalculations(  require( 'fs' ).readFileSync( '/dev/stdin' ,  'utf8' )  ) ;