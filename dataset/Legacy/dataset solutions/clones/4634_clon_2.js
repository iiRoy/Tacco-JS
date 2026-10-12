function ProcessInput( rawData ){
    rawData = rawData.split("\n");

    /*
    var itemCount = parseInt(rawData[0],10);
    var initialArray = rawData[1].split(" ");

    for(var idx = 0;idx < itemCount;idx++){
        initialArray[idx] = parseInt(initialArray[idx],10);
    }
    */

    rawData[0] = rawData[0].split(" ");
    var itemCount = parseInt(rawData[0][0],10);
    var boundaryLength = parseInt(rawData[0][1],10);
    var timeElapsed = parseInt(rawData[0][2],10);

    var positions, directions, finalPositions, collisionCounts;
    positions = new Array(100001);
    directions  = new Array(100001);
    finalPositions = new Array(100001);
    collisionCounts = new Array(100001);

    for(var idx = 0; idx < itemCount; idx++){
        rawData[idx + 1] = rawData[idx + 1].split(" ");
        positions[idx] = parseInt(rawData[idx + 1][0],10);
        directions[idx] = parseInt(rawData[idx + 1][1],10);
        collisionCounts[idx] = 0;
    }

    for(var idx = 0; idx < itemCount; idx++){
        var directionFactor;
        if(directions[idx] === 1)
            directionFactor = 1;
        else
            directionFactor = -1;
        finalPositions[idx] = (positions[idx] + timeElapsed * directionFactor) % boundaryLength;
        if(finalPositions[idx] < 0)
            finalPositions[idx] += boundaryLength;
    }

    for(var idx = 1; idx < itemCount; idx++){
        if(directions[0] === directions[idx]){
            collisionCounts[idx] = 0;
        } else {
            var timeDifference = timeElapsed * 2;

            var posA, posB;

            if(directions[0] === 1){
                posA = positions[0];
                posB = positions[idx];
            } else {
                posA = positions[idx];
                posB = positions[0];
            }
            collisionCounts[idx] = 0;
            if(posB >= posA){
                 timeDifference -= posB - posA;
            } else {
                timeDifference -= boundaryLength - posA + posB;
            }
            if(timeDifference >= 0)
                collisionCounts[idx]++;
            else
                timeDifference = 0;
            collisionCounts[idx] += timeDifference / boundaryLength | 0;
        }
    }

    var totalCollisions = 0;

    for(var idx = 1; idx < itemCount; idx++){
        totalCollisions += collisionCounts[idx];
    }
    totalCollisions %= itemCount;
    if(directions[0] === 2)
        totalCollisions = (itemCount - totalCollisions) % itemCount;

    var initialPosition = finalPositions[0];
    finalPositions[itemCount] = 10000000000;
    finalPositions.sort(function(val1, val2){
        if( val1 < val2 ) return -1;
        if( val1 > val2 ) return 1;
        return 0;
    });

    var startIndex;
    finalPositions[itemCount] = -1000;
    for(var idx = 0; idx < itemCount; idx++){
        if(finalPositions[idx] === initialPosition && finalPositions[(idx + 1) % itemCount] !== initialPosition){
            startIndex = idx;
            break;
        }
        else if(finalPositions[idx] === initialPosition && finalPositions[(idx + 1) % itemCount] === initialPosition){
            if(directions[0] === 1)
                startIndex = idx + 1;
            else
                startIndex = idx;
            break;
        }
    }
    startIndex = (itemCount + startIndex - totalCollisions) % itemCount;

    for(var idx = 0; idx < itemCount; idx++){
        console.log(finalPositions[startIndex++]);
        if(startIndex === itemCount)
            startIndex = 0;
    }
}

ProcessInput( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );
