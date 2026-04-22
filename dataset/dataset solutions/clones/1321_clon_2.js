// Retrieve entire content from standard input source, removing outer whitespace.
const   sourceText  =   require ( 'fs' ) .  readFileSync ( '/dev/stdin' ,  'utf8' ) .  trim ( ) ;

    // Divide the main text into an array of individual rows.
const dataRows  =   sourceText  .   trim ( ) .   split ( "\n" ) ;

// Extract the first row, normalize it to lowercase, this is our target search term.
const   searchPhrase    =   dataRows [ 0 ] .   trim ( ) .   toLowerCase ( ) ;

// Initialize a counter for matches, an index for current row, and fetch the first segment.
let hitTally    =   0   ,
    rowIndex    =   1   ,
    currentSegment  =   dataRows [ rowIndex ] ;

  // Loop through each segment until the end marker is found.
while   (   currentSegment  !== 'END_OF_TEXT'   )
{
    // Convert the current segment to lowercase for case-insensitive comparison.
    currentSegment  =   currentSegment  .   toLowerCase ( ) ;

    // Split the segment into words, filter for matches, and add their count to the total.
    hitTally    +=  currentSegment  .   trim ( ) .   split ( ' ' ) .   filter (    lexeme  =>  lexeme  === searchPhrase    ) .   length ;


    // Move to the next segment in the array.
    currentSegment  =   dataRows [ ++ rowIndex ] ;
}

// Display the final tally of occurrences.
console . log ( hitTally ) ;