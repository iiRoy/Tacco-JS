function ProcessData(rawData) {
    const lineArray = rawData.split('\n');

    const pairArrays = lineArray.map(currentLine => currentLine.split(' '));

    const pairSets = lineArray.map(currentLine => new Set(currentLine.split(' ')));

    // Calculate initial count of distinct clusters
    let distinctGroups = pairArrays.length;

    for ( let outerIndex = 1; outerIndex < pairArrays.length; outerIndex++ ) { // Starting from the second element
        for ( let innerIndex = 0; innerIndex < outerIndex; innerIndex++ ) { // Comparing with preceding elements
            if ( ( new Set(pairSets[innerIndex]) ).has(pairArrays[outerIndex][0]) || ( new Set(pairSets[innerIndex][0]) ).has(pairArrays[outerIndex][1]) ) {
                distinctGroups--;
                break;
            }
        }
    }

    console.log(distinctGroups);
}

ProcessData( require("fs").readFileSync("/dev/stdin", "utf8").trim() );