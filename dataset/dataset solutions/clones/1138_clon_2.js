/*
 * This module provides a function to solve a variation of the knapsack problem.
 * It computes the maximum value that can be obtained by selecting items
 * within a given weight capacity, using dynamic programming.
 */
function calculateOptimalGain ( ) {
   // Initialize the dynamic programming grid (table) for storing optimal values.
   // Each cell dpGrid[objIndex][weightConstraint] will store the maximum value for 'objIndex' items
   // with a weight constraint of 'weightConstraint'.
   var dpGrid = [ ] ;

   // Create inner arrays for each row of the dpGrid.
   for ( let objIndex = 0 ; objIndex <= objectCount ; objIndex++ ) dpGrid[ objIndex ] = [ ] ;

   // Initialize the first row: zero value if capacity is zero.
   for ( let weightConstraint = 0 ; weightConstraint <= maxWeightCapacity ; weightConstraint++ ) dpGrid[ 0 ] [ weightConstraint ] = 0 ;

   // Initialize the first column: zero value if no objects are considered.
   for ( let objIndex = 0 ; objIndex <= objectCount ; objIndex++ ) dpGrid[ objIndex ] [ 0 ] = 0 ;

   // Iterate through each object, starting from the first (index 1).
   for ( let objIndex = 1 ; objIndex <= objectCount ; objIndex++ ) {
      // Iterate through each possible weight constraint, starting from 1.
      for ( let weightConstraint = 1 ; weightConstraint <= maxWeightCapacity ; weightConstraint++ ) {

         // Check if the current object's weight is within the problem's total maximum capacity.
         // (This condition is exactly as per the original code; it checks against maxWeightCapacity, not current weightConstraint).
         if ( artifactList[ objIndex ].weightAmount <= maxWeightCapacity ) {
            // Apply the dynamic programming recurrence relation.
            // This specific recurrence structure (including terms with dpGrid[objIndex])
            // handles a variant of the knapsack problem where items might be taken multiple times
            // or a specific problem formulation.
            // Note: If `weightConstraint - artifactList[objIndex].weightAmount` is negative,
            // accessing `dpGrid` will yield `undefined`, leading to `NaN` in `Math.max`
            // if not handled by other arguments. This behavior is preserved from the original.
            dpGrid[ objIndex ] [ weightConstraint ] = Math.max(
               dpGrid[ objIndex - 1 ] [ weightConstraint ] , // Option 1: Do not include the current object
               artifactList[ objIndex ].valueAmount + dpGrid[ objIndex - 1 ] [ weightConstraint - artifactList[ objIndex ].weightAmount ] , // Option 2: Include current object once (0/1 style)
               artifactList[ objIndex ].valueAmount + dpGrid[ objIndex ] [ weightConstraint - artifactList[ objIndex ].weightAmount ] // Option 3: Include current object, potentially multiple times (unbounded style)
            ) ;
         } else {
            // If the current object's weight exceeds the overall problem's capacity,
            // it cannot be considered, so the value is carried over from the previous item set.
            dpGrid[ objIndex ] [ weightConstraint ] = dpGrid[ objIndex - 1 ] [ weightConstraint ] ;
         }
      }
   }
   // The final optimal value is found at the cell representing all objects and the full capacity.
   return dpGrid[ objectCount ] [ maxWeightCapacity ] ;
}

// --- Application Entry Point: Input Parsing and Result Display ---

// Read all raw text from standard input using Node.js's file system module and UTF-8 encoding.
var sourceData = require('fs').readFileSync ( '/dev/stdin' , 'UTF8' ) ;

// Pre-process the input string: remove leading/trailing whitespace, then split by newline characters.
var dataLines = ( sourceData.trim( ) ) . split ( '\n' ) ;

// Extract the first line which contains global configuration parameters (object count and max capacity).
var initialParameters = ( dataLines.shift( ) ) . split ( ' ' ) . map ( Number ) ;

// Assign the parsed configuration values to globally accessible variables.
var objectCount = initialParameters[ 0 ] ;
var maxWeightCapacity = initialParameters[ 1 ] ;

// Prepare an array to store details for each artifact.
// The first element is set to null to enable 1-based indexing,
// aligning with typical DP table logic.
var artifactList = [ null ] ;

// Iterate to parse details for each artifact from the input lines.
for ( let objIndex = 1 ; objIndex <= objectCount ; objIndex++ ) {
   // Split each line to get the value and weight of the current artifact.
   var currentArtifactDetails = ( dataLines.shift( ) ) . split ( ' ' ) . map ( Number ) ;
   // Store the artifact's properties as an object in the list.
   artifactList[ objIndex ] = { valueAmount : currentArtifactDetails[ 0 ] , weightAmount : currentArtifactDetails[ 1 ] } ;
}

// Invoke the core dynamic programming function to calculate the maximum achievable gain.
var finalMaxGain = calculateOptimalGain ( ) ;

// Display the calculated optimal gain to the standard output.
console.info ( finalMaxGain ) ; // Using console.info instead of console.log for a minor change.