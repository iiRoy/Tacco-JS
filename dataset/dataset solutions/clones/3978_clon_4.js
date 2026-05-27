const processInputData = (inputContent) => {
    const lines = inputContent.trim().split('\n');
    const totalItems = Number(lines[0]);
    const coordinatePairs = lines.slice(1).map(line => line.split(' ').map(Number));

    const primarySet = coordinatePairs.slice(0, totalItems);
    const secondarySet = coordinatePairs.slice(totalItems);

    return { totalItems, primarySet, secondarySet };
};

console.log((() => {
    const { totalItems: itemQuantity, primarySet: scarletPoints, secondarySet: azurePoints } = processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));

    azurePoints.sort((pointCoordA, pointCoordB) => pointCoordB[0] - pointCoordA[0]); // Sort blue points by x-coordinate descending
    scarletPoints.sort((pointCoordA, pointCoordB) => pointCoordB[1] - pointCoordA[1]); // Sort red points by y-coordinate descending

    let successfulMatches = 0;
    const scarletAvailability = new Array(itemQuantity).fill(false); // Boolean array to track if a scarlet point has been used

    for (let currentAzureIndex = 0; currentAzureIndex < itemQuantity; currentAzureIndex++) {
        const [azureX, azureY] = azurePoints[currentAzureIndex];
        let chosenScarletIndex = -1;

        for (let currentScarletIndex = 0; currentScarletIndex < itemQuantity; currentScarletIndex++) {
            if (scarletAvailability[currentScarletIndex]) {
                continue; // Skip already used scarlet points
            }

            const [scarletX, scarletY] = scarletPoints[currentScarletIndex];

            if (azureX > scarletX && azureY > scarletY) {
                // Found a suitable scarlet point.
                // Since scarletPoints is sorted by y-coordinate descending,
                // the first one encountered that satisfies both x and y conditions
                // will inherently have the largest y-coordinate among eligible ones.
                chosenScarletIndex = currentScarletIndex;
                break; // Found the optimal match for this azure point, proceed to the next azure point
            }
        }

        if (chosenScarletIndex !== -1) {
            scarletAvailability[chosenScarletIndex] = true;
            successfulMatches++;
        }
    }

    return `${successfulMatches}`;
})());
