function processText ( rawData ) {
    // This variable stores segments of the input, split by newlines after trimming.
    const originalSegments = rawData .  trim() . split( '\n' ) ;

    /*
     * The character sequence is derived from the raw data,
     * after removing leading/trailing whitespace and splitting into individual characters.
     */
    const charSequence = rawData . trim() . split ( '' ) ;

    // Compare the stringified version of the segments against the reversed character sequence.
    if ( originalSegments == charSequence . reverse() . join( "" ) ) {
        console . log ( 'YES' ) ; // Output for a match
    }
    else {
        console . log ( 'NO' ) ; // Output for no match
    }
}

// Initiate the text processing by reading content from standard input.
processText ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;