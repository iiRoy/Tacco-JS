/*
 * This script processes a series of dice configurations
 * to determine if any configuration is a duplicate of a previously seen one,
 * considering all possible rotations and orientations of a standard six-sided die.
 */

// Function to simulate shifting the dice's orientation based on a cardinal direction
function  shiftBlock  (  directionIndicator  ,  faceArray  )
{
   // Extract individual face values from the input array
   var  topFace  =  faceArray[ 0 ] ; // Represents the current top face
   var  frontFace  =  faceArray[ 1 ] ; // Represents the current front face
   var  rightFace  =  faceArray[ 2 ] ; // Represents the current right face
   var  leftFace  =  faceArray[ 3 ] ; // Represents the current left face
   var  backFace  =  faceArray[ 4 ] ; // Represents the current back face
   var  bottomFace  =  faceArray[ 5 ] ; // Represents the current bottom face

   var  transformedFaces  =  [ ] ; // Array to hold the new face configuration

   // Apply the transformation based on the given direction
   if  ( directionIndicator  ===  "N" )  transformedFaces  =  [ frontFace , bottomFace , rightFace , leftFace , topFace , backFace ] ; // Move North
   if  ( directionIndicator  ===  "S" )  transformedFaces  =  [ backFace , topFace , rightFace , leftFace , bottomFace , frontFace ] ; // Move South
   if  ( directionIndicator  ===  "E" )  transformedFaces  =  [ leftFace , frontFace , topFace , bottomFace , backFace , rightFace ] ; // Move East
   if  ( directionIndicator  ===  "W" )  transformedFaces  =  [ rightFace , frontFace , bottomFace , topFace , backFace , leftFace ] ; // Move West

   return  transformedFaces ; // Return the new orientation
}


// Function to simulate a specific rotation (e.g., clockwise spin) of the dice
function  rotateBlock  (  faceArray  )
{
   // Extract individual face values
   var  topFace  =  faceArray[ 0 ] ;
   var  frontFace  =  faceArray[ 1 ] ;
   var  rightFace  =  faceArray[ 2 ] ;
   var  leftFace  =  faceArray[ 3 ] ;
   var  backFace  =  faceArray[ 4 ] ;
   var  bottomFace  =  faceArray[ 5 ] ;

   var  transformedFaces  =  [ ] ; // Array to hold the new face configuration

   // Apply the fixed rotation: Top stays, Front -> Right, Right -> Back, Back -> Left, Left -> Front, Bottom stays
   transformedFaces  =  [ topFace , rightFace , backFace , frontFace , leftFace , bottomFace ] ;

   return  transformedFaces ; // Return the rotated orientation
}


// Function to explore all 4 rotations of a given dice configuration
// and register them, checking for duplicates against a global set.
function  exploreOrientations  (  blockState  )
{
   var  configRegistry  =  { } ; // Local registry for current block's rotations

   // Iterate through 4 rotations to find all unique configurations for the current top face
   for  ( var  idx  =  0 ;  idx  <  4 ;  ++idx  )
   {
      var  stateString  =  blockState.join( "," ) ; // Create a string key for the current configuration
      // If this specific rotation hasn't been seen for the current block, register it
      if  (  ! configRegistry.hasOwnProperty( stateString )  )  {
         configRegistry[ stateString ]  =  true ;
      }
      blockState  =  rotateBlock( blockState ) ; // Apply the rotation for the next iteration
   }

   // Now, check the locally registered unique rotations against the global registry
   for  ( var  registeredKey  in  configRegistry  )
   {
      // If this configuration (key) is already in the global registry, it's a duplicate
      if  (  globalSeenConfigurations.hasOwnProperty( registeredKey )  )  {
         finalVerdict  =  "No" ; // Set the global flag to indicate a duplicate
      }
      else  {
         globalSeenConfigurations[ registeredKey ]  =  true ; // Register this new unique configuration globally
      }
   }
}


// --- Main Program Execution ---

// Read input from standard input
var  rawData  =  require( 'fs' ).readFileSync( '/dev/stdin' ,  'utf8' ) ;
// Process input: trim whitespace and split into lines
var  inputLines  =  ( rawData.trim() ).split( "\n" ) ;
// Get the number of dice configurations to process (first line of input)
var  numConfigurations  =  inputLines.shift() - 0 ; // Convert string to number explicitly

var  globalSeenConfigurations  =  { } ; // Global object to store all unique dice configurations encountered
var  finalVerdict  =  "Yes" ; // Initial assumption: all configurations are unique

// Loop through each provided dice configuration
for  ( var  idx  =  0 ;  idx  <  numConfigurations ;  ++idx  )
{
   // Parse the current dice configuration from the input line
   var  currentBlock  =  inputLines[ idx ].split( " " ).map( Number ) ;

   // Explore 24 total orientations for each dice:
   // 4 rotations for each of the 6 possible top faces.
   // This loop explores 4 rotations for the current top face.
   for  ( var  iterationCount  =  0 ;  iterationCount  <  4 ;  ++iterationCount  )
   {
      exploreOrientations( currentBlock ) ; // Explore and register rotations
      currentBlock  =  shiftBlock( "N" , currentBlock ) ; // Shift the block "North" to change the top face
   }

   // After 4 "N" shifts, the block has returned to its original top face but potentially a different front face.
   // Now, shift East to get a new set of 4 top faces for exploration.
   currentBlock  =  shiftBlock( "E" , currentBlock ) ;
   exploreOrientations( currentBlock ) ; // Explore rotations for this new orientation

   // Shift South twice to get another new orientation (effectively West then South)
   currentBlock  =  shiftBlock( "S" , currentBlock ) ;
   currentBlock  =  shiftBlock( "S" , currentBlock ) ;
   exploreOrientations( currentBlock ) ; // Explore rotations for this final orientation

   // If a duplicate was found at any point, stop processing
   if  ( finalVerdict  ===  "No" )  {
      break ;
   }
}

// Output the final result
console.log( finalVerdict ) ;