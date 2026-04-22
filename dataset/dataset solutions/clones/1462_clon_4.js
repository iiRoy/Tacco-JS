(function(sourceData) {
    const sectionComponents = sourceData.split(/\r?\n/);

    const mainCollectionExtent = parseInt(sectionComponents[0], 10);

    const lookupCandidates = sectionComponents[3].split(' ').map(elementString => parseInt(elementString, 10));

    const checkBounds = (valToVerify, upperBoundary) => 
        valToVerify >= 0 && valToVerify < upperBoundary;

    const matchedCount = lookupCandidates.filter(itemToExamine =>
        checkBounds(itemToExamine, mainCollectionExtent)
    ).length;

    console.log(matchedCount);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));