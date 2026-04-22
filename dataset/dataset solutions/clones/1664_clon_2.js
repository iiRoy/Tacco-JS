function CalculateMinCollisionTime( rawInputData ) {
    let parsedLines = rawInputData.trim().split( '\n' );
    let coordinateStrings = parsedLines.map( function( elementString ) {
        return elementString.split( ' ' );
    } );

    let numberOfCoordinates = parseInt( coordinateStrings[0][0], 10 );
    let coordinateDirections = [];

    for ( let idx = 0 ; idx < numberOfCoordinates ; idx++ ) {
        coordinateDirections.push( [
            parseInt( coordinateStrings[idx + 1][0], 10 ),
            parseInt( coordinateStrings[idx + 1][1], 10 ),
            coordinateStrings[idx + 1][2]
        ] );
    }

    coordinateDirections.sort( function( firstPoint, secondPoint ) {
        const sumA = firstPoint[0] + firstPoint[1];
        const sumB = secondPoint[0] + secondPoint[1];

        if ( sumA < sumB ) {
            return -1;
        }
        if ( sumA > sumB ) {
            return 1;
        }
        if ( firstPoint[0] < secondPoint[0] ) {
            return -1;
        }
        if ( firstPoint[0] > secondPoint[0] ) {
            return 1;
        }
        return 0;
    } );

    let currentGroupValue = -1;
    let lastKnownRelevantCoordinate;
    let minimumEncounterTime = Infinity;
    let lastEncounteredDirection = 'Up';

    for ( let idx = 0 ; idx < coordinateDirections.length ; idx++ ) {
        const currentPoint = coordinateDirections[idx];
        const currentSum = currentPoint[0] + currentPoint[1];
        const currentX = currentPoint[0];
        const currentDir = currentPoint[2];

        if ( currentGroupValue === currentSum ) {
            if ( lastEncounteredDirection === 'Right' ) {
                if ( currentDir === 'Up' ) {
                    lastEncounteredDirection = 'Up';
                    minimumEncounterTime = Math.min( minimumEncounterTime, Math.abs( currentX - lastKnownRelevantCoordinate ) * 10 );
                } else if ( currentDir === 'R' ) {
                    lastKnownRelevantCoordinate = currentX;
                }
            } else {
                if ( currentDir === 'R' ) {
                    lastEncounteredDirection = 'Right';
                    lastKnownRelevantCoordinate = currentX;
                }
            }
        } else {
            currentGroupValue = currentSum;
            if ( currentDir === 'R' ) {
                lastEncounteredDirection = 'Right';
                lastKnownRelevantCoordinate = currentX;
            } else {
                lastEncounteredDirection = 'Up';
            }
        }
    }

    currentGroupValue = -1;
    lastEncounteredDirection = 'Left';

    for ( let idx = 0 ; idx < coordinateDirections.length ; idx++ ) {
        const currentPoint = coordinateDirections[idx];
        const currentSum = currentPoint[0] + currentPoint[1];
        const currentX = currentPoint[0];
        const currentDir = currentPoint[2];

        if ( currentGroupValue === currentSum ) {
            if ( lastEncounteredDirection === 'D' ) {
                if ( currentDir === 'L' ) {
                    lastEncounteredDirection = 'Left';
                    minimumEncounterTime = Math.min( minimumEncounterTime, Math.abs( currentX - lastKnownRelevantCoordinate ) * 10 );
                } else if ( currentDir === 'D' ) {
                    lastKnownRelevantCoordinate = currentX;
                }
            } else {
                if ( currentDir === 'D' ) {
                    lastEncounteredDirection = 'D';
                    lastKnownRelevantCoordinate = currentX;
                }
            }
        } else {
            currentGroupValue = currentSum;
            if ( currentDir === 'D' ) {
                lastEncounteredDirection = 'D';
                lastKnownRelevantCoordinate = currentX;
            } else {
                lastEncounteredDirection = 'Left';
            }
        }
    }

    coordinateDirections.sort( function( firstPoint, secondPoint ) {
        const diffA = firstPoint[1] - firstPoint[0];
        const diffB = secondPoint[1] - secondPoint[0];

        if ( diffA < diffB ) {
            return -1;
        }
        if ( diffA > diffB ) {
            return 1;
        }
        if ( firstPoint[0] < secondPoint[0] ) {
            return -1;
        }
        if ( firstPoint[0] > secondPoint[0] ) {
            return 1;
        }
        return 0;
    } );

    currentGroupValue = Infinity;
    lastEncounteredDirection = 'D';

    for ( let idx = 0 ; idx < coordinateDirections.length ; idx++ ) {
        const currentPoint = coordinateDirections[idx];
        const currentDiff = currentPoint[1] - currentPoint[0];
        const currentX = currentPoint[0];
        const currentDir = currentPoint[2];

        if ( currentGroupValue === currentDiff ) {
            if ( lastEncounteredDirection === 'R' ) {
                if ( currentDir === 'D' ) {
                    lastEncounteredDirection = 'D';
                    minimumEncounterTime = Math.min( minimumEncounterTime, Math.abs( currentX - lastKnownRelevantCoordinate ) * 10 );
                } else if ( currentDir === 'R' ) {
                    lastKnownRelevantCoordinate = currentX;
                }
            } else {
                if ( currentDir === 'R' ) {
                    lastEncounteredDirection = 'R';
                    lastKnownRelevantCoordinate = currentX;
                }
            }
        } else {
            currentGroupValue = currentDiff;
            if ( currentDir === 'R' ) {
                lastEncounteredDirection = 'R';
                lastKnownRelevantCoordinate = currentX;
            } else {
                lastEncounteredDirection = 'D';
            }
        }
    }

    currentGroupValue = Infinity;
    lastEncounteredDirection = 'Left';

    for ( let idx = 0 ; idx < coordinateDirections.length ; idx++ ) {
        const currentPoint = coordinateDirections[idx];
        const currentDiff = currentPoint[1] - currentPoint[0];
        const currentX = currentPoint[0];
        const currentDir = currentPoint[2];

        if ( currentGroupValue === currentDiff ) {
            if ( lastEncounteredDirection === 'Up' ) {
                if ( currentDir === 'L' ) {
                    lastEncounteredDirection = 'Left';
                    minimumEncounterTime = Math.min( minimumEncounterTime, Math.abs( currentX - lastKnownRelevantCoordinate ) * 10 );
                } else if ( currentDir === 'U' ) {
                    lastKnownRelevantCoordinate = currentX;
                }
            } else {
                if ( currentDir === 'U' ) {
                    lastEncounteredDirection = 'Up';
                    lastKnownRelevantCoordinate = currentX;
                }
            }
        } else {
            currentGroupValue = currentDiff;
            if ( currentDir === 'U' ) {
                lastEncounteredDirection = 'Up';
                lastKnownRelevantCoordinate = currentX;
            } else {
                lastEncounteredDirection = 'Left';
            }
        }
    }

    coordinateDirections.sort( function( firstPoint, secondPoint ) {
        if ( firstPoint[0] < secondPoint[0] ) return -1;
        if ( firstPoint[0] > secondPoint[0] ) return 1;
        if ( firstPoint[1] < secondPoint[1] ) return -1;
        if ( firstPoint[1] > secondPoint[1] ) return 1;
        return 0;
    } );

    currentGroupValue = -1;
    lastEncounteredDirection = 'D';

    for ( let idx = 0 ; idx < coordinateDirections.length ; idx++ ) {
        const currentPoint = coordinateDirections[idx];
        const currentX = currentPoint[0];
        const currentY = currentPoint[1];
        const currentDir = currentPoint[2];

        if ( currentGroupValue === currentX ) {
            if ( lastEncounteredDirection === 'Up' ) {
                if ( currentDir === 'D' ) {
                    lastEncounteredDirection = 'D';
                    minimumEncounterTime = Math.min( minimumEncounterTime, Math.abs( currentY - lastKnownRelevantCoordinate ) * 5 );
                } else if ( currentDir === 'U' ) {
                    lastKnownRelevantCoordinate = currentY;
                }
            } else {
                if ( currentDir === 'U' ) {
                    lastEncounteredDirection = 'Up';
                    lastKnownRelevantCoordinate = currentY;
                }
            }
        } else {
            currentGroupValue = currentX;
            if ( currentDir === 'U' ) {
                lastEncounteredDirection = 'Up';
                lastKnownRelevantCoordinate = currentY;
            } else {
                lastEncounteredDirection = 'D';
            }
        }
    }

    coordinateDirections.sort( function( firstPoint, secondPoint ) {
        if ( firstPoint[1] < secondPoint[1] ) return -1;
        if ( firstPoint[1] > secondPoint[1] ) return 1;
        if ( firstPoint[0] < secondPoint[0] ) return -1;
        if ( firstPoint[0] > secondPoint[0] ) return 1;
        return 0;
    } );

    currentGroupValue = -1;
    lastEncounteredDirection = 'Left';

    for ( let idx = 0 ; idx < coordinateDirections.length ; idx++ ) {
        const currentPoint = coordinateDirections[idx];
        const currentY = currentPoint[1];
        const currentX = currentPoint[0];
        const currentDir = currentPoint[2];

        if ( currentGroupValue === currentY ) {
            if ( lastEncounteredDirection === 'R' ) {
                if ( currentDir === 'L' ) {
                    lastEncounteredDirection = 'Left';
                    minimumEncounterTime = Math.min( minimumEncounterTime, Math.abs( currentX - lastKnownRelevantCoordinate ) * 5 );
                } else if ( currentDir === 'R' ) {
                    lastKnownRelevantCoordinate = currentX;
                }
            } else {
                if ( currentDir === 'R' ) {
                    lastEncounteredDirection = 'R';
                    lastKnownRelevantCoordinate = currentX;
                }
            }
        } else {
            currentGroupValue = currentY;
            if ( currentDir === 'R' ) {
                lastEncounteredDirection = 'R';
                lastKnownRelevantCoordinate = currentX;
            } else {
                lastEncounteredDirection = 'Left';
            }
        }
    }

    let collisionOutcome = minimumEncounterTime === Infinity ? "SAFE" : minimumEncounterTime;
    console.log( collisionOutcome );
}


CalculateMinCollisionTime( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );