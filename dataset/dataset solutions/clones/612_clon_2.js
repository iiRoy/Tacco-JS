process.stdin.resume ( ) ;


process.stdin.setEncoding ( 'utf8' ) ;


process.stdin.on (
  'data' ,

  function ( receivedDataBlock ) {

    let inputRows = receivedDataBlock.split ( "\n" ) ;


    const totalEntries = parseInt ( inputRows[ 0 ] , 10 ) ;


    let referencePattern = inputRows[ 1 ] ;


    let outerLoopCounter , innerLoopCounter , patternComponentLength ;


    let successCount = 0 ;


    for ( outerLoopCounter = 2 ; outerLoopCounter <= totalEntries ; outerLoopCounter ++ ) {

      const patternComponents = referencePattern.split ( '' ) ;


      const currentTargetLine = inputRows[ outerLoopCounter ] ;


      let characterPosition , previousCharacterPosition = 0 , positionalOffset = 0 , matchIndicator = true ;
      let lastPositionalOffset = 0 ;


      patternComponentLength = patternComponents.length ;


      for ( innerLoopCounter = 0 ; innerLoopCounter < patternComponentLength ; innerLoopCounter ++ ) {

        characterPosition = currentTargetLine.substring ( previousCharacterPosition ).indexOf ( patternComponents[ innerLoopCounter ] ) ;


        if ( characterPosition === -1 ) {
          matchIndicator = false ;
          break ;
        }

        previousCharacterPosition = characterPosition ;


        lastPositionalOffset = positionalOffset ;
      }


      if ( matchIndicator ) {
        successCount ++ ;
      }
    }


    console.log ( successCount ) ;
  }
) ;