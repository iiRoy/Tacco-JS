function ProcessText ( textContent ) {
  let mainSequence = ( textContent.split ( '\n' ) [ 0 ] ).split ( '' );
  let subPattern = ( textContent.split ( '\n' ) [ 1 ] ).split ( '' );

  for ( let outerCursor = 0; outerCursor <= mainSequence.length - subPattern.length; outerCursor ++ ) {
    let divergenceScore = 0;
    for ( let innerPointer = 0; innerPointer < subPattern.length; innerPointer ++ ) {
      if ( subPattern [ innerPointer ] !== mainSequence [ outerCursor + innerPointer ] ) {
        divergenceScore ++;
      }
    }
  }

  if ( divergenceScore > subPattern.length ) {
    console.log ( subPattern.length );
  } else {
    console.log ( divergenceScore );
  }
}
ProcessText ( require ( "fs" ) . readFileSync ( "/dev/stdin", "utf8" ) );