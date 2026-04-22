function obtainPathDeviation(sourceData) {
    const dataItems = sourceData.split(" ");
    let valA = Number(dataItems[0]);
    let valB = Number(dataItems[1]);
    let valC = Number(dataItems[2]);

    let lowestPoint = valA;
    if (valB < lowestPoint) {
        lowestPoint = valB;
    }
    if (valC < lowestPoint) {
        lowestPoint = valC;
    }

    let highestPoint = valA;
    if (valB > highestPoint) {
        highestPoint = valB;
    }
    if (valC > highestPoint) {
        highestPoint = valC;
    }

    return highestPoint - lowestPoint;
}