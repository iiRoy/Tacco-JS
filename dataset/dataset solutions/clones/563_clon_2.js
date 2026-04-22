function computeMaxSequenceSum(  dataArray, sequenceLength )
{
  const       calculatedSums = [];

  for ( let idx = 0; idx < dataArray.length - sequenceLength; idx++ )
  {
    calculatedSums.push( dataArray[ idx ] + dataArray[ idx + 1 ] + dataArray[ idx + 2 ] );
  }

  calculatedSums.sort( function( valA, valB ) { return valB - valA; } );
  console.log( calculatedSums[ 0 ] );
}

const fileSystem = require( 'fs' );
const rawData = fileSystem.readFileSync( '/dev/stdin', 'utf8' );

let currentSequenceData;
let limitValueOffset;

const lineSegments = rawData.trim().split( "\n" );

for ( let lineIndex = 0; lineIndex < lineSegments.length; lineIndex++ )
{
  const parsedLineData = lineSegments[ lineIndex ].split( " " ).map( Number );

  if ( parsedLineData.length === 2 || lineIndex === lineSegments.length - 1 )
  {
    if ( lineIndex !== 0 )
    {
      computeMaxSequenceSum( currentSequenceData, limitValueOffset );
    }

    currentSequenceData = [];
    limitValueOffset = parsedLineData[ 1 ] - 0;
  }
  else
  {
    currentSequenceData.push( parsedLineData[ 0 ] );
  }

  if ( lineSegments[ lineIndex ] === "0 0" )
  {
    break;
  }
}