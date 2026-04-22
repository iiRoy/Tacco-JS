'use strict';

// This file processes textual data to find a specific pattern.

/**
 * Executes the primary logic for pattern detection within given content.
 * @param {string} sourceContent The raw textual input data.
 */
const processInput = ( sourceContent ) => {
    // Break down the source content into lines, then further into words/tokens.
    const  tokenizedLines = sourceContent . split ( '\n' ) . map (  lineSegment  =>  lineSegment . split ( ' ' )  ) ;

    // Extract the primary string of interest from the first token of the first line.
    const  examinedSequence = tokenizedLines [ 0 ] [ 0 ] ;

    // Determine the total number of characters in the sequence.
    const  sequenceSize = examinedSequence . length ;

    // Initialize a flag to track whether the target pattern has been found.
    let  patternFound = false ;

    // Iterate through the sequence, checking for a specific two-character substring.
    for  (  let  currentPosition = 0 ;  currentPosition < sequenceSize - 1 ;  currentPosition++  ) {
        // If the current two-character slice matches "AC", set the flag to true.
        if  (  examinedSequence . slice (  currentPosition ,  currentPosition + 2  )  ===  'AC'  )  {
            patternFound = true ;
        }
    }

    // Output the result based on whether the pattern was identified.
    console . log (  patternFound  ?  'Yes'  :  'No'  ) ;
};

// Initiate the processing by reading input from standard input.
processInput ( require ( 'fs' ) . readFileSync (  '/dev/stdin' ,  'utf8'  ) ) ;