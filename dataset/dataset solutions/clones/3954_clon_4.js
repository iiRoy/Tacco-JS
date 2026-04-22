function ProcessJourneyData(inputString) {
    const passageSections = inputString.split('\n');
    const pointQuantity = Number(passageSections[0]);
    const coordinateStrings = passageSections[1].split(/\s+/).filter(Boolean);

    const numericCoordinates = coordinateStrings.map(Number);

    const computePathDistance = (pathSegments) => {
        let totalTravel = 0;
        for (let j = 0; j < pathSegments.length - 1; ++j) {
            totalTravel += Math.abs(pathSegments[j] - pathSegments[j + 1]);
        }
        return totalTravel;
    };

    const outcomeDistances = [];

    for (let k = 0; k < pointQuantity; ++k) {
        const modifiedPath = [0];
        for (let m = 0; m < pointQuantity; ++m) {
            if (m !== k) {
                modifiedPath.push(numericCoordinates[m]);
            }
        }
        modifiedPath.push(0);

        const currentModifiedDistance = computePathDistance(modifiedPath);
        outcomeDistances.push(currentModifiedDistance);
    }

    outcomeDistances.forEach(dist => console.log(dist));
}

ProcessJourneyData(require("fs").readFileSync("/dev/stdin", "utf8"));