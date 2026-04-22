// Module: Journey Optimizer
'use strict';

const VERBOSE_LOGGING = false ;
const initialData = VERBOSE_LOGGING
  ? "3\n5 10 15"
  : require('node:fs')
      .readFileSync('/dev/stdin', 'utf-8')
      .trim() ;

const calculateOptimalPath = incomingText => {
  const primarySegments = incomingText.split('\n') ;
  const totalLocations = Number.parseInt(primarySegments[0]) ;
  const extendedLocations = [
    0 ,
    ...primarySegments[1].split(' ').map( element => Number.parseInt(element) ) ,
    0
  ] ;

  const overallLength = extendedLocations.reduce(
    ( accumulator, currentValue, currentIndex ) =>
      currentIndex === 0 ? accumulator : accumulator + Math.abs( currentValue - extendedLocations[currentIndex - 1] ) ,
    0
  ) ;

  for ( let iterationIndex = 1 ; iterationIndex < totalLocations + 1 ; iterationIndex++ ) {
    const priorLocation = extendedLocations[iterationIndex - 1] ;
    const omittedLocation = extendedLocations[iterationIndex] ;
    const subsequentLocation = extendedLocations[iterationIndex + 1] ;

    const lengthToRemove =
      Math.abs(omittedLocation - priorLocation) + Math.abs(omittedLocation - subsequentLocation) ;
    const lengthToAppend = Math.abs(priorLocation - subsequentLocation) ;

    console.log( overallLength - lengthToRemove + lengthToAppend ) ;
  }
} ;

calculateOptimalPath(initialData);