// This function consumes the entire incoming textual dataset.
function  ProcessInputData ( sourceText ) {

  let   characterSequence = sourceText . split ( "" );

    /*
     * The first character's value is extracted and stored.
     * The characterSequence array will undergo modifications.
     */
    const  initialCharacter = characterSequence [ 0 ];

    // The inaugural character is now redundant in the sequence, so it's removed.
    characterSequence . splice ( 0, 1 );

    let   alteredString = sourceText . replace ( initialCharacter, '' );
    let   occurrenceIndex = alteredString . search ( initialCharacter );

  	// Scan for and eliminate the first instance of the initial character within the sequence.
  	characterSequence . splice ( occurrenceIndex, 1 );

    // Re-evaluate the string after the previous replacement.
    alteredString = alteredString . replace ( initialCharacter, '' );

    // Find the next occurrence of the initial character.
    occurrenceIndex = alteredString . search ( initialCharacter );

  	// Ascertain if the pair of remaining characters are identical.
  	if  ( characterSequence [ 0 ]  ===  characterSequence [ 1 ] )
      console . log ( "Yes" );
    else
      console . log ( "No" );
}

// Please refrain from modifying any code situated below this demarcation line.
// This section is responsible for reading standard input and invoking the core processing routine.
ProcessInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin", "utf8" ) );