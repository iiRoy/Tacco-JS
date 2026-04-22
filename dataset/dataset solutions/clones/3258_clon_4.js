function calculateAscent(dataStream) {
    const dataLines = dataStream.split('\n');
    const heightValues = dataLines[1].split(' ').map(Number);

    if (heightValues.length === 0) {
        console.log(0);
        return;
    }

    const initialTraversalState = {
        totalElevation: heightValues[0],
        lastObservedHeight: heightValues[0]
    };

    const finalTraversalState = heightValues.slice(1).reduce((currentState, currentPoint) => {
        const potentialRise = currentPoint - currentState.lastObservedHeight;
        const actualRise = Math.max(0, potentialRise);

        return {
            totalElevation: currentState.totalElevation + actualRise,
            lastObservedHeight: currentPoint
        };
    }, initialTraversalState);

    console.log(finalTraversalState.totalElevation);
}

calculateAscent(require("fs").readFileSync("/dev/stdin", "utf8"));