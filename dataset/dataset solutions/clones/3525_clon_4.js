let collectedData = '';

process.stdin.on('data', (inputFragment) => {
    collectedData += inputFragment.toString();
});

process.stdin.on('end', () => {
    const locateMax = (currentMax, itemValue) => (currentMax > itemValue ? currentMax : itemValue);
    const locateMin = (currentMin, itemValue) => (currentMin < itemValue ? currentMin : itemValue);

    const processedLines = collectedData
        .trim()
        .split('\n')
        .map(lineSegment => lineSegment.split(' ').map(strNum => parseInt(strNum, 10)));

    const initialConfig = processedLines[0];
    const realmADesires = processedLines[1];
    const realmBDesires = processedLines[2];

    const empireAOrigin = initialConfig[2];
    const empireBOrigin = initialConfig[3];

    const empireAMaxInfluence = realmADesires.reduce(locateMax, -201); 
    const empireBMinInfluence = realmBDesires.reduce(locateMin, 201);  

    const potentialConflict =
        (empireAMaxInfluence >= empireBOrigin) ||
        (empireBMinInfluence <= empireAOrigin) ||
        (empireAMaxInfluence >= empireBMinInfluence);

    if (potentialConflict) {
        process.stdout.write("War\n");
    } else {
        process.stdout.write("No War\n");
    }
});