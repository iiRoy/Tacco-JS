const   obtainModuleReference = require ;
const   displayOutput = console .log;

let         rawDataStream = obtainModuleReference('fs') .readFileSync('/dev/stdin', 'utf8')
    ;

let     processedLinesCollection = (rawDataStream.trim()) .split("\n")
;

while (     true
) {
    let     currentDimensionPairString = processedLinesCollection.shift();

    if ( currentDimensionPairString === "0 0" ) {
        break;
    }

    let         dimensionNumericValues = currentDimensionPairString.split(" ").map(Number)
        ;

    let     totalItemCount = dimensionNumericValues[0]
        ;
    let     eliminationStride = dimensionNumericValues[1]
        ;

    let         itemPresenceFlags = []
        ;

    for ( let   itemIdx = 0; itemIdx <= totalItemCount; itemIdx++ )
    {
            itemPresenceFlags[itemIdx] = true;
    }

    let         currentCyclePosition = 1
        ;
    let         stepsSinceLastRemoval = 0
        ;
    let         removedItemCounter = 0
        ;

    while (     true
    ) {
        if ( itemPresenceFlags[currentCyclePosition] ) {
                stepsSinceLastRemoval++;

            if ( stepsSinceLastRemoval === eliminationStride ) {
                    itemPresenceFlags[currentCyclePosition] = false;
                    stepsSinceLastRemoval = 0;
                    removedItemCounter++;

                if ( removedItemCounter === itemPresenceFlags.length - 2 ) {
                    break;
                }
            }
        }

        currentCyclePosition++;

        if ( itemPresenceFlags.length - 1 < currentCyclePosition ) {
            currentCyclePosition = 1;
        }
    }

    for ( let   finalResultIndex = 1; finalResultIndex <= totalItemCount; finalResultIndex++ )
    {
        if ( itemPresenceFlags[finalResultIndex] ) {
            displayOutput(finalResultIndex);
        }
    }
}