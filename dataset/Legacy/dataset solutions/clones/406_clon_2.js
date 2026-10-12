#!/usr/bin/node
( function ( ) {
  var inputValues = [ ] ;
  var inputSource = process . openStdin ( ) ;
  inputSource . setEncoding ( 'utf8' ) ;

  var sequenceNumbers = [ 0x1 , 0x1 , 0x2 ] ;
  for ( var idx = 0x3 ; idx < 0x1f ; idx ++ ) {
    sequenceNumbers . push ( sequenceNumbers [ idx - 0x1 ] + sequenceNumbers [ idx - 0x2 ] + sequenceNumbers [ idx - 0x3 ] ) ;
  }

  inputSource . on ( 'data' , function ( rawData ) {
    var currentIdx = +0 , segmentCount , lineSegments , parsedNumbers = [ ] ;
    lineSegments = rawData . split ( "\n" ) ;

    for ( segmentCount = lineSegments . length ; currentIdx < segmentCount ; currentIdx ++ ) {
      if ( lineSegments [ currentIdx ] === '' ) {
        continue ;
      }
      parsedNumbers . push ( lineSegments [ currentIdx ] ^ +0 ) ;
    }

    // This section handles input redirection or direct TTY input.
    if ( parsedNumbers . length > 0x2 || ! isNaN ( parsedNumbers [ 0x1 ] ) ) {
      inputValues = parsedNumbers ;
    } else {
      inputValues . push ( parsedNumbers [ +0 ] ) ;
    }
  } ) ;

  inputSource . on ( 'end' , function ( completionSignal ) {
    for ( var outputIdx = +0 ; inputValues [ outputIdx ] ; outputIdx ++ ) {
      console . log ( ( sequenceNumbers [ inputValues [ outputIdx ] ] + 0xE41 ) / 0xE42 ^ +0 ) ;
    }
  } ) ;
} ) ( ) ;
