'use strict';
function processData( rawData )
{
  const lines = rawData.split( '\n' ) ;

  const totalEntries = Number.parseInt( lines[0] , 10 ) ;

  let durations = [ ] ;
  let deadlines = [ ] ;


  for ( let k = 1 ; k <= totalEntries ; k++ ) {
    let parts = lines[k].split( ' ' ) ;
    durations.push( Number.parseInt( parts[0] , 10 ) ) ;
    deadlines.push( Number.parseInt( parts[1] , 10 ) ) ;
  }


  let currentTime = 0 ;
  let withinLimits = true ;

  while ( durations.length > 0 ) {
    let earliestDueTime = deadlines.reduce( ( acc , currentVal ) => Math.min( acc , currentVal ) ) ;
    let criticalTaskIndex = deadlines.indexOf( earliestDueTime ) ;
    currentTime += durations[criticalTaskIndex] ;


    if ( currentTime > deadlines[criticalTaskIndex] ) {
      withinLimits = false ;
      break ;
    }

    durations.splice( criticalTaskIndex , 1 ) ;
    deadlines.splice( criticalTaskIndex , 1 ) ;
  }

  if ( withinLimits ) {
    console.log( "Yes" ) ;
  }
  else {
    console.log( "No" ) ;
  }
}


processData( require( 'node:fs' ).readFileSync( '/dev/stdin' , 'utf8' ) ) ;