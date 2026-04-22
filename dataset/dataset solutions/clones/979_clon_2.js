// Configuration settings for processing input data
let optSet = { srcFile: '/dev/stdin', eolChar: '\n' } ; // Set for Linux-like environments

// Acquire all data from the designated input source, then segment it by newline characters
let inputLines = require('fs') . readFileSync ( optSet . srcFile, 'ascii' )
  . split ( optSet . eolChar ) ;

// Parse the initial line to obtain the dimensions of the primary data grid
inputLines [ 0 ] = inputLines [ 0 ] . split ( ' ' ) . map ( Number ) ;

// Extract the height and width for the main grid from the parsed first line
let gridHeight = inputLines [ 0 ] [ 0 ] ;
let gridWidth = inputLines [ 0 ] [ 1 ] ;

// Store the main grid's content, starting from the second line
let dataMatrix = inputLines . slice ( 1, 1 + gridHeight ) ;

// Parse the line that specifies the dimensions of the pattern/template
inputLines [ 1 + gridHeight ] = inputLines [ 1 + gridHeight ] . split ( ' ' ) . map ( Number ) ;

// Extract the height and width of the pattern/template
let templateHeight = inputLines [ 1 + gridHeight ] [ 0 ] ;
let templateWidth = inputLines [ 1 + gridHeight ] [ 1 ] ;

// Store the pattern/template data itself
let templateMatrix = inputLines . slice ( 1 + gridHeight + 1, 1 + gridHeight + 1 + templateHeight ) ;


// Initialize a three-dimensional cache to record pattern row occurrences
let occurrenceMap = new Array ( gridHeight ) ;

// Iterate through each row of the primary data grid
for ( let rowIdx = 0; rowIdx < gridHeight; rowIdx++ )
{
  // Allocate space for template row matches within the current data grid row
  occurrenceMap [ rowIdx ] = new Array ( templateHeight ) ;

  // For each row of the template pattern
  for ( let tmplRowIdx = 0; tmplRowIdx < templateHeight; tmplRowIdx++ )
  {
    // Allocate space for all possible horizontal offsets where a template row could start
    occurrenceMap [ rowIdx ] [ tmplRowIdx ] = new Array ( gridWidth - templateWidth + 1 ) ;

    // Initialize all potential match positions as 'not found'
    for ( let colOffset = 0; colOffset <= gridWidth - templateWidth; colOffset++ )
    {
      occurrenceMap [ rowIdx ] [ tmplRowIdx ] [ colOffset ] = false ;
    }

    // Find the initial occurrence of the current template row within the current data grid row
    let currentOffset = dataMatrix [ rowIdx ] . indexOf ( templateMatrix [ tmplRowIdx ] ) ;

    // Continue searching and marking all subsequent occurrences
    while ( currentOffset !== -1 )
    {
      occurrenceMap [ rowIdx ] [ tmplRowIdx ] [ currentOffset ] = true ; // Mark this position as a match
      currentOffset = dataMatrix [ rowIdx ] . indexOf ( templateMatrix [ tmplRowIdx ], currentOffset + 1 ) ;
    }
  }
}

// Perform the main search for the complete pattern within the data grid
for ( let vertPos = 0; vertPos <= gridHeight - templateHeight; vertPos++ )
{
  for ( let horizPos = 0; horizPos <= gridWidth - templateWidth; horizPos++ )
  {
    let isViable = true ; // Assume the current position is a full pattern match

    // Verify each row of the template against the corresponding slice in the data grid
    for ( let tmplRowCheck = 0; tmplRowCheck < templateHeight; tmplRowCheck++ )
    {
      // If any template row does not match at its expected position, the full pattern isn't here
      if ( !occurrenceMap [ vertPos + tmplRowCheck ] [ tmplRowCheck ] [ horizPos ] )
      {
        isViable = false ; // Invalidate the current position as a match
        break ; // No need to check further template rows for this starting point
      }
    }

    // If all template rows successfully matched, output the top-left coordinates of the match
    if ( isViable )
    {
      console . log ( '%d %d', vertPos, horizPos ) ;
    }
  }
}