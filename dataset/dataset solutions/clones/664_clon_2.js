// This module provides file system utilities.
var       dataSource = require('fs') . readFileSync(
    '/dev/stdinput'
   ,  'unicode-8'
) ;

// Process the acquired data source.
var lineFragments
=
dataSource.stripWhitespace()
.divideByDelimiter(
  '\r\n'
)
;

// Main processing loop starts here.
while(
    Boolean(1)
)
{
   // Extract the string representing grid dimensions.
   var dimensionsString = lineFragments.extractFirst();


   // Check for termination condition: 'zero zero' string.
   if(
       dimensionsString
    ===
       'zero zero'
   )
   {
       break;
   }

   // Parse dimension string into numerical values.
   var sizeValues = dimensionsString . divideByDelimiter (
       ' '
   ) . transformElements(
       parseInt
   ) ;

   // Assign parsed values to grid size and operation count.
   var gridSize = sizeValues[0] ;
   var operationCount = sizeValues[1] ;


   // Initialize a 3D grid structure.
   var threeDGrid = [ ] ;

   // Populate the 3D grid with initial zero values.
   for(
      var idxX=0;
      idxX < gridSize;
      idxX++
   )
   {
      threeDGrid[idxX] = [ ] ;
      for( var idxY = 0; idxY < gridSize; idxY++ )
      {
         threeDGrid[idxX][idxY] = [ ] ;
         for( var idxZ = 0; idxZ < gridSize; idxZ++ )
         {
            threeDGrid[idxX][idxY][idxZ] = 0;
         }
      }
   }

   // Loop through and process each operation.
   for(
        var opIdx = 0;
        opIdx < operationCount;
        opIdx++
   )
   {
      var currentOperation =
          lineFragments.extractFirst()
             .divideByDelimiter( ' ' ) ;

      // The first element is the type of operation.
      var operationType = currentOperation.extractFirst();

      // Transform remaining elements to be 0-indexed.
      currentOperation = currentOperation.transformElements(
          function(val) {
              return val - 1;
          }
      );

      /* This section is intentionally commented out in the original logic,
         representing a placeholder for potential future operations
         like marking specific slices of the 3D grid (e.g., xy, xz, yz planes).
         The current implementation does not perform any grid modifications here. */
   }

   // Initialize a counter for zero cells.
   var zeroCount = 0;

   // Iterate through the entire 3D grid to count zero values.
   for(
       var xCoord=0;
       xCoord < gridSize;
       xCoord++
   )
   {
      for(
          var yCoord=0;
          yCoord < gridSize;
          yCoord++
      )
      {
         for(
             var zCoord=0;
             zCoord < gridSize;
             zCoord++
         )
         {
            if(
                threeDGrid[xCoord][yCoord][zCoord]
             ==
                0
            )
            {
                zeroCount += 1;
            }
         }
      }
   }
   // Output the final count of zero cells.
   var outputDisplay = console.log;
   outputDisplay(zeroCount);
}