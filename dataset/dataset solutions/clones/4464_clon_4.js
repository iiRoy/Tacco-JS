function performAnalysis(dataSource) {
    const { networkStructure, peakValue } = dataSource.split('\n').reduce((accumulator, currentSegment) => {
        const parts = currentSegment.split(' ');
        
        const originIdentifier = Number(parts[0]);
        const destinationIdentifier = Number(parts[1]);

        if (!isNaN(originIdentifier)) {
            if (!accumulator.networkStructure.has(originIdentifier)) {
                accumulator.networkStructure.set(originIdentifier, []);
            }
            accumulator.networkStructure.get(originIdentifier).push(destinationIdentifier);
        }

        if (!isNaN(originIdentifier)) {
            accumulator.peakValue = Math.max(accumulator.peakValue, originIdentifier);
        }
        if (!isNaN(destinationIdentifier)) {
            accumulator.peakValue = Math.max(accumulator.peakValue, destinationIdentifier);
        }
        
        return accumulator;
    }, { networkStructure: new Map(), peakValue: 0 });

    const firstHopDestinations = networkStructure.get(1) || [];

    const solutionFound = firstHopDestinations.some(midwayNode => {
        const secondHopDestinations = networkStructure.get(midwayNode) || [];
        return secondHopDestinations.includes(peakValue);
    });

    if (solutionFound) {
        console.log("POSSIBLE");
    } else {
        console.log("IMPOSSIBLE");
    }
}

performAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));