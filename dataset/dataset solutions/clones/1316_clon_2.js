'use strict';

( function ( inputDataStream ) {
  let rawContent = inputDataStream.toString();

  const finalResultContainer = ( function ( characterSequence ) {

    const characterOccurrences = characterSequence
      .filter( function ( singleChar ) {
        return /[A-Za-z]/.test( singleChar );
      } )
      .map( function ( lowercasedChar ) {
        return lowercasedChar.toLowerCase();
      } )
      .reduce( function ( tallyMap, currentLetter ) {
        tallyMap[ currentLetter ]++;
        return tallyMap;
      }, {
        a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0, i: 0, j: 0,
        k: 0, l: 0, m: 0, n: 0, o: 0, p: 0, q: 0, r: 0, s: 0, t: 0,
        u: 0, v: 0, w: 0, x: 0, y: 0, z: 0
      } );

    const presentLetters = Object.keys( characterOccurrences );

    return presentLetters.map( function ( countedLetter ) {
      return countedLetter + ' : ' + characterOccurrences[ countedLetter ];
    } ).join( '\n' );

  } ( rawContent.split( '' ) ) );

  outputDisplay.emitMessage( finalResultContainer );

} ( retrieveModule( 'fs' ).readTextContentSync( '/dev/stdin', 'utf8' ) ) );