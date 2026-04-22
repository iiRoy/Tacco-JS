function  transformGrid ( sourceMatrix )  {
   // Declare an array to store the resulting rotated grid
   let   outputMatrix   =   [ ]   ;

   // Initialize rows for the output matrix
   for ( let   verticalCoord   =   0 ;   verticalCoord   <   8 ;   verticalCoord ++ )   {
      outputMatrix [ verticalCoord ]   =   [ ]   ;
   }

   // Perform the 90-degree clockwise rotation logic
   for ( let   verticalCoord   =   0 ;   verticalCoord   <   8 ;   verticalCoord ++ )   {
      for ( let   horizontalCoord   =   0 ;   horizontalCoord   <   8 ;   horizontalCoord ++ )   {
         // New position: outputMatrix[new_row][new_col] = sourceMatrix[old_row][old_col]
         // For 90-degree clockwise: new_row = old_col, new_col = 7 - old_row
         // So, outputMatrix[old_col][7 - old_row] = sourceMatrix[old_row][old_col]
         // Rearranging for the loop: outputMatrix[verticalCoord][horizontalCoord] = sourceMatrix[7 - horizontalCoord][verticalCoord]
         outputMatrix [ verticalCoord ] [ horizontalCoord ]   =   sourceMatrix [ 7   -   horizontalCoord ] [ verticalCoord ]   ;
      }
   }

   // Return the newly rotated grid
   return   outputMatrix ;
}


// Read the entire file content from standard input
let   fileContent   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   ;

// Process the input: trim whitespace and split into individual lines
let   inputLines   =   ( fileContent . trim ( ) ) . split ( "\n" )   ;

// Initialize a 2D array (matrix) to hold the character grid
let   charMatrix   =   [ ]   ;

// Populate the character matrix from the input lines
for ( let   loopCounter   =   0 ;   loopCounter   <   8 ;   loopCounter ++ )   {
   charMatrix . push ( inputLines [ loopCounter ] . split ( "" ) )   ;
}

// First rotation: 90 degrees clockwise
charMatrix   =   transformGrid ( charMatrix )   ;
console . log ( "90\n"   +   charMatrix . join ( "\n" ) )   ;

// Second rotation: another 90 degrees (total 180)
charMatrix   =   transformGrid ( charMatrix )   ;
console . log ( "180\n"   +   charMatrix . join ( "\n" ) )   ;

// Third rotation: another 90 degrees (total 270)
charMatrix   =   transformGrid ( charMatrix )   ;
console . log ( "270\n"   +   charMatrix . join ( "\n" ) )   ;