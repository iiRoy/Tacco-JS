'use strict';
(function ( rawInputText ) {
  let processedLines = rawInputText.trim().split( /[\n]+/ );

  const maleCount = processedLines.shift() - 0;
  const totalStates = Math.pow( 2, maleCount );
  const moduloVal = 1_000_000_000 + 7;

  processedLines = processedLines.map( lineString => lineString.split( /\s+/ ).map( numericValue => +numericValue ) );
  const compatibilityGrid = processedLines;

  // This structure maps a bit count to an object containing masks with that many bits set.
  const maskByBitCount = new Array( maleCount ).fill( null ).map( _placeholder => ({}) );
  for ( let currentBitmask = 1; currentBitmask < totalStates; currentBitmask++ ) {
    let tempBitmask = currentBitmask;
    let setBitCount = 0;
    while ( tempBitmask > 0 ) {
      setBitCount += ( tempBitmask % 2 );
      tempBitmask = ( tempBitmask - tempBitmask % 2 ) / 2;
    }
    maskByBitCount[ setBitCount - 1 ][ currentBitmask ] = currentBitmask;
  }

  // Initialize the dynamic programming table.
  // memoizationTable[i][j] will store the count of valid pairings
  // for males up to index 'i' with females represented by bitmask 'j'.
  const memoizationTable = new Array( maleCount ).fill( null ).map( ( _placeholder, levelIdx ) => ({}) );
  memoizationTable[ -1 ] = new Array( totalStates ).fill( 1 ); // Base case: 0 males, 1 way (empty set)

  /*
   * The core dynamic programming loop calculates the number of ways to match
   * males with females.
   * `memoizationTable[currentMaleIndex][subsetMask]` represents the number of valid
   * matchings for males from 0 to `currentMaleIndex` with the set of females
   * indicated by `subsetMask`.
   * We iterate through each male, and for each male, we consider all possible
   * subsets of females that could be matched.
   */
  for ( let currentMaleIndex = 0; currentMaleIndex < maleCount; currentMaleIndex++ ) {
    for ( let subsetMask in maskByBitCount[ currentMaleIndex ] ) {
      // Ensure the entry exists for the current state
      if ( memoizationTable[ currentMaleIndex ][ subsetMask ] === undefined ) {
        memoizationTable[ currentMaleIndex ][ subsetMask ] = 0;
      }

      for ( let possibleFemaleIndex = 0; possibleFemaleIndex < maleCount; possibleFemaleIndex++ ) {
        // If the current male and female are not compatible, skip.
        if ( compatibilityGrid[ currentMaleIndex ][ possibleFemaleIndex ] === 0 ) continue;
        // If the female is not part of the current subset, skip.
        if ( ( subsetMask & ( 1 << possibleFemaleIndex ) ) === 0 ) continue;

        // Add the count from the previous state (maleIndex-1) where the current female
        // was not yet considered (i.e., removed from the subsetMask).
        memoizationTable[ currentMaleIndex ][ subsetMask ] += ( memoizationTable[ currentMaleIndex - 1 ][ subsetMask ^ ( 1 << possibleFemaleIndex ) ] || 0 );
        memoizationTable[ currentMaleIndex ][ subsetMask ] %= moduloVal;
      }
    }
  }

  // The final answer is the number of ways to match all males with all females.
  console.log( memoizationTable[ maleCount - 1 ][ totalStates - 1 ] || 0 );

})( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );