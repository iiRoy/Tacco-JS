const fileSystem = require('fs');

function processTextualData(sourceLocation) {
    const rawSource = fileSystem.readFileSync(sourceLocation, 'utf8');
    const cleanSource = rawSource.trim();

    const patternUnits = cleanSource.match(/(egg|chicken)/g) || [];

    const symbolicRepresentation = patternUnits.map(unit => unit === 'egg' ? 0 : 1);

    const expandedSymbolicSequence = [];
    for (let i = 0; i < symbolicRepresentation.length; i++) {
        if (i > 0 && symbolicRepresentation[i] === symbolicRepresentation[i - 1]) {
            expandedSymbolicSequence.push(-1); // A unique marker for separation
        }
        expandedSymbolicSequence.push(symbolicRepresentation[i]);
    }

    const segmentedCollections = expandedSymbolicSequence.reduce((acc, item) => {
        if (item === -1) {
            acc.push([]);
        } else {
            if (acc.length === 0 || acc[acc.length - 1].length === 0) {
                acc.push([item]);
            } else {
                acc[acc.length - 1].push(item);
            }
        }
        return acc;
    }, []).filter(collection => collection.length > 0);

    let predominantCollection = [];
    if (segmentedCollections.length > 0) {
        predominantCollection = segmentedCollections.reduce((longestCandidate, currentCandidate) => {
            return currentCandidate.length > longestCandidate.length ? currentCandidate : longestCandidate;
        }, []);
    }

    if (predominantCollection.length === 0) {
        console.log("chicken");
    } else {
        const finalDiscriminator = predominantCollection[predominantCollection.length - 1];
        console.log(finalDiscriminator === 0 ? 'egg' : 'chicken');
    }
}

processTextualData('/dev/stdin');