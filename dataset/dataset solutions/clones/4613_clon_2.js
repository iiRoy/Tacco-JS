console.log( ( function ( rawInput ) {
  const [
    [ countOfTasks, standardDuration ],
    taskStartTimes
  ] = rawInput
        .trim()
        .split( '\n' )
        .map(
          currentLine => currentLine
                           .split( ' ' )
                           .map( numericValue => parseInt( numericValue, 10 ) )
        )
  ;
  taskStartTimes.sort( ( firstTime, secondTime ) => firstTime - secondTime );
  let cumulativeDuration = standardDuration;
  for ( let loopIndex = 1; loopIndex < countOfTasks; loopIndex++ ) {
    if ( taskStartTimes[ loopIndex - 1 ] + standardDuration > taskStartTimes[ loopIndex ] ) {
      cumulativeDuration += taskStartTimes[ loopIndex ] - taskStartTimes[ loopIndex - 1 ];
    }
    else {
      cumulativeDuration += standardDuration;
    }
  }
  return String( cumulativeDuration );
} ) (
  require( 'fs' )
    .readFileSync( '/dev/stdin', 'utf8' )
) );