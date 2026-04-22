( function  mainRoutine ( )  {
  // Acquire the raw input from standard input, process it into an array of characters
  let  inputChars  =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) . trim ( ) . split ( '' ) ;

  // A collection to store the successive elevation measurements, starting with a base of zero
  let  elevationLevels  =  [ 0 ] ;
  // Variable to keep track of the current vertical position
  let  currentElevation  =  0 ;

  // Eliminate any leading upward slopes or flat sections until a downward slope is encountered
  while  ( inputChars . length  >  0  &&  inputChars [ 0 ]  !==  '\\' )  inputChars . shift ( ) ;
  // Remove any trailing downward slopes or flat sections until an upward slope is encountered
  while  ( inputChars . length  >  0  &&  inputChars [ inputChars . length  -  1 ]  !==  '/' )  inputChars . pop ( ) ;

  // Iterate through each character in the refined input sequence
  inputChars . forEach (  function (  symbolCharacter ,  positionIndex  )  {
    if  ( symbolCharacter  ===  '\\' )  currentElevation  -=  1 ; // Downward slope represented by '\'
    else  if  ( symbolCharacter  ===  '_' )  currentElevation  +=  0 ; // Flat ground represented by '_'
    else  currentElevation  +=  1 ; // Upward slope represented by '/'
    elevationLevels . push ( currentElevation ) ; // Add the new elevation to the record
  } ) ;

  // Initialize the total accumulated water volume
  let  totalWaterVolume  =  0 ;
  // An array to hold the individual volumes of detected water pockets
  let  waterPockets  =  [ ] ;

  // Continue processing the elevation data as long as there are potential basins to analyze
  for  ( ;  elevationLevels . length  >  1 ; )  {
    let  currentBasinVolume  =  calculateBasinVolume ( elevationLevels ) ; // Compute the volume of a potential basin
    if  ( currentBasinVolume  >  0 )  {
      totalWaterVolume  +=  currentBasinVolume ; // Add to the grand total
      waterPockets . push ( currentBasinVolume ) ; // Record the individual basin's volume
    }
  }

  // Display the total quantity of collected water
  console . log ( totalWaterVolume ) ;
  // If water pockets were found, display their count and individual volumes, otherwise print nothing for the second line
  console . log ( waterPockets . length  &&  waterPockets . length  +  ' '  +  waterPockets . join ( ' ' ) ) ;
} ) ( ) ;


// Function to determine the volume of a single water-holding basin from a given height profile
function  calculateBasinVolume (  heightProfile  )  {
  // Extract the initial elevation point for comparison and remove it from the profile
  let  initialLevel  =  heightProfile . shift ( ) ;

  // Check if a basin can truly form at this point:
  // 1. The very next point in the profile must be lower than the initial level.
  // 2. The initial level must not be higher than the maximum subsequent level,
  //    ensuring there's a "wall" on the right side to hold water.
  if  ( heightProfile [ 0 ]  <  initialLevel  &&  initialLevel  <=  heightProfile . reduce (  (  maxSoFar ,  currentPoint  )  =>  Math . max ( maxSoFar , currentPoint ) ,  -100000  )  )  {
    let  currentBasinArea  =  0 ; // Accumulator for the water volume in this specific basin
    while  (  true  )  {
      // Break the loop if the profile is exhausted or if an elevation equal to or higher than the initial level is met
      if  ( heightProfile . length  ===  0  ||  initialLevel  <=  heightProfile [ 0 ]  )  break ;
      // Calculate water trapped at the current point (initialLevel - currentProfilePoint)
      // and add it to the basin area, then remove the current point
      currentBasinArea  +=  initialLevel  -  heightProfile . shift ( ) ;
    }
    return  currentBasinArea ; // Return the calculated basin volume
  }  else  {
    return  0 ; // No valid basin found starting at this initial level
  }
}