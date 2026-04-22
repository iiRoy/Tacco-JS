'use strict';
( function( initialPayload )
{
  initialPayload = initialPayload.trim().split( /\r?\n/ );

  const totalEntities   = Number( initialPayload.shift() );
  const maxSubsets      = Math.pow( 2, totalEntities );
  const primeModulus    = Math.pow( 10, 9 ) + 7;

  initialPayload = initialPayload.map( lineString => lineString.split( /\s{1,}/ ).map( numericVal => parseInt( numericVal, 10 ) ) );

  const compatibilityMatrix = initialPayload;

  const subsetTracker = new Array( totalEntities ).fill( null ).map( _ => ( {} ) );

  for ( let currentSubsetIndex = 1; currentSubsetIndex < maxSubsets; ++currentSubsetIndex )
  {
    let workingSubsetRepresentation = currentSubsetIndex;
    let populationCount = 0;

    while ( workingSubsetRepresentation > 0 )
    {
      populationCount += ( workingSubsetRepresentation & 1 );
      workingSubsetRepresentation >>>= 1; // Unsigned right shift for bit counting
    }
    subsetTracker[ populationCount - 1 ][ currentSubsetIndex ] = currentSubsetIndex;
  }


  const solutionGrid = new Array( totalEntities ).fill( null ).map( ( _, entityIndex ) => ( {} ) );
  solutionGrid[ 0 - 1 ] = new Array( maxSubsets ).fill( 1.0 );

  /*
   * This dynamic programming table, 'solutionGrid',
   * calculates the total number of ways to form valid pairings.
   * `solutionGrid[ maleIdx ][ femaleMask ]` stores the count of possibilities
   * to match the first `maleIdx + 1` males with a specific group of females,
   * where `femaleMask` is a bitmask representing that female group.
   * The process iterates through males from the initial one to the final male.
   */

  for ( let currentMaleIndex = 0; currentMaleIndex < totalEntities; ++currentMaleIndex )
  {
    for ( let currentFemaleIndex = 0; currentFemaleIndex < totalEntities; ++currentFemaleIndex )
    {
      if ( compatibilityMatrix[ currentMaleIndex ][ currentFemaleIndex ] === 1 )
      {
        for ( let activeFemalesMask in subsetTracker[ currentMaleIndex ] )
        {
          // Ensure the current female is part of the active female subset
          if ( ! ( activeFemalesMask & ( 1 << currentFemaleIndex ) ) ) {
              continue;
          }

          if ( solutionGrid[ currentMaleIndex ][ activeFemalesMask ] === undefined ) {
            solutionGrid[ currentMaleIndex ][ activeFemalesMask ] = 0.0;
          }

          solutionGrid[ currentMaleIndex ][ activeFemalesMask ] += ( solutionGrid[ currentMaleIndex - 1 ][ activeFemalesMask ^ ( 1 << currentFemaleIndex ) ] || 0 );
          solutionGrid[ currentMaleIndex ][ activeFemalesMask ] %= primeModulus;
        }
      }
    }
  }

  console.log( solutionGrid[ totalEntities - 1 ][ maxSubsets - 1 ] || 0 );

} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );