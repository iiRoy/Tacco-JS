const ProcessInput = ( rawDataValue => {
  "use strict";

  let parsedWords = rawDataValue . split ( "\n" ) [ 1 ] . split ( " " ) ;

  let wordFrequencyMap = { } ;

  for ( const currentWordItem of parsedWords ) {
    wordFrequencyMap[ currentWordItem ] = ( wordFrequencyMap[ currentWordItem ] || 0 ) + 1 ;
  }

  for ( const uniqueKey of Object.keys( wordFrequencyMap ) ) {
    wordFrequencyMap[ uniqueKey ] = {
      itemCount: wordFrequencyMap[ uniqueKey ],
      combinationsOfTwo: wordFrequencyMap[ uniqueKey ] * ( wordFrequencyMap[ uniqueKey ] - 1 ) / 2,
      combinationsExcludingSelf: ( wordFrequencyMap[ uniqueKey ] - 1 ) * ( wordFrequencyMap[ uniqueKey ] - 2 ) / 2
    };
  }

  let finalSummation ;

  for ( let positionIndex = 0; positionIndex < parsedWords.length; positionIndex++ ) {
    const currentElement = parsedWords[ positionIndex ];
    finalSummation = 0 ;

    for ( const comparedKey of Object.keys( wordFrequencyMap ) ) {
      finalSummation += ( currentElement === comparedKey )
        ? wordFrequencyMap[ comparedKey ].combinationsExcludingSelf
        : wordFrequencyMap[ comparedKey ].combinationsOfTwo;
    }
    console.log( finalSummation ) ;
  }
});

ProcessInput( require( "fs" ) . readFileSync ( "/dev/stdin", "utf8" ) . trim ( ) ) ;