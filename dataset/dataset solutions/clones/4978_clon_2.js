function ProcessInput ( rawLines ) {
    const dimensionData = rawLines[0] . split(" ") . map( strVal => parseInt(strVal, 10) );

    const gridRows = dimensionData[0] - 2;
    const gridCols = dimensionData[1] - 2;
    const numPoints = dimensionData[2];

    let neighborTracker = [ {}, {}, {} ];

    for ( let pointIdx = 0; pointIdx < numPoints; pointIdx++ ) {
        rawLines[pointIdx] = rawLines[pointIdx + 1] . split(" ") . map( coordinateStr => parseInt(coordinateStr, 10) );
    }

    rawLines.pop();

    rawLines = rawLines.sort( (pointA, pointB) => pointA[0] - pointB[0] );

    let neighborTallies = Array(10) . fill(0);
    let scanRow = 1;

    for ( let pointIdx = 0; pointIdx < numPoints; pointIdx++ ) {
        let skippedRowCounter = 0;

        while ( scanRow + 2 < rawLines[pointIdx][0] ) {
            for ( let cellKey in neighborTracker[scanRow % 3] ) {
                neighborTallies[neighborTracker[scanRow % 3][cellKey]]++;
            }
            neighborTracker[scanRow % 3] = {};
            scanRow++;
            skippedRowCounter++;

            if ( skippedRowCounter >= 3 ) {
                scanRow = rawLines[pointIdx][0] - 2;
            }
        }
        updateCounts( rawLines[pointIdx][1], rawLines[pointIdx][0] );
    }

    function updateCounts ( targetX, targetY ) {
        for ( let colOffset = -2; colOffset <= 0; colOffset++ ) {
            if ( targetX + colOffset < 1 ) {
                continue;
            }
            if ( targetX + colOffset > gridCols ) {
                break;
            }

            for ( let rowOffset = -2; rowOffset <= 0; rowOffset++ ) {
                let actualRow = targetY + rowOffset;
                if ( actualRow < 1 ) {
                    continue;
                }
                if ( actualRow > gridRows ) {
                    break;
                }

                let neighborCol = targetX + colOffset;

                if ( !neighborTracker[actualRow % 3][neighborCol] ) {
                    neighborTracker[actualRow % 3][neighborCol] = 1;
                } else {
                    neighborTracker[actualRow % 3][neighborCol]++;
                }
            }
        }
    }

    for ( let modIndex = 0; modIndex < 3; modIndex++ ) {
        for ( let cellKey in neighborTracker[modIndex] ) {
            neighborTallies[neighborTracker[modIndex][cellKey]]++;
        }
    }

    neighborTallies[0] = gridRows * gridCols;
    let overflowDigit = 0;

    if ( neighborTallies[0] > 9e15 ) {
        neighborTallies[0] = ( gridRows % 1e5 * gridCols );
        overflowDigit = Math.floor( neighborTallies[0] / 1e5 );
        neighborTallies[0] %= 1e5;
    }

    for ( let countVal = 1; countVal <= 9; countVal++ ) {
        neighborTallies[0] -= neighborTallies[countVal];
    }

    if ( overflowDigit ) {
        overflowDigit += Math.floor( gridRows / 1e5 ) * gridCols;
        while ( neighborTallies[0] < 0 ) {
            overflowDigit--;
            neighborTallies[0] += 1e5;
        }
        neighborTallies[0] = ( "00000" + neighborTallies[0] % 1e5 ) . slice(-5);
        neighborTallies[0] = overflowDigit + "" + neighborTallies[0];
    }

    console.log( neighborTallies.join("\n") );
}

ProcessInput(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
        .split("\n")
);