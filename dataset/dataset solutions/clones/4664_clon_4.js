const calculateSpatialSeparation = (pointAlpha, pointBeta) => {
    return Math.abs(pointAlpha.coordX - pointBeta.coordX) + Math.abs(pointAlpha.coordY - pointBeta.coordY);
};

const processSystemInput = (rawTextContent) => {
    const contentSegments = rawTextContent.trim().split('\n');

    const obtainDimensions = (linesArray) => {
        const [dimA, dimB] = linesArray.shift().split(' ').map(Number);
        return { quantityA: dimA, quantityB: dimB };
    };

    const parseCoordinateSets = (count, linesArray) => {
        const collection = [];
        for (let k = 0; k < count; k++) {
            const [xVal, yVal] = linesArray.shift().split(' ').map(Number);
            collection.push({ coordX: xVal, coordY: yVal });
        }
        return collection;
    };

    const { quantityA: individualCount, quantityB: facilityCount } = obtainDimensions(contentSegments);

    const individualLocations = parseCoordinateSets(individualCount, contentSegments);
    const facilityLocations = parseCoordinateSets(facilityCount, contentSegments).map((facility, index) => ({
        ...facility,
        facilityIndex: index + 1
    }));

    const determinedAssignments = individualLocations.map(currentPerson => {
        const facilityProximities = facilityLocations.map(currentFacility => ({
            designator: currentFacility.facilityIndex,
            proximity: calculateSpatialSeparation(currentPerson, currentFacility)
        }));

        const nearestFacility = facilityProximities.reduce((closestCandidate, currentConsideration) => {
            if (currentConsideration.proximity < closestCandidate.proximity) {
                return currentConsideration;
            } else if (currentConsideration.proximity === closestCandidate.proximity) {
                if (currentConsideration.designator < closestCandidate.designator) {
                    return currentConsideration;
                }
            }
            return closestCandidate;
        }, { proximity: Number.POSITIVE_INFINITY, designator: -1 });

        return nearestFacility.designator;
    });

    determinedAssignments.forEach(assignment => console.log(assignment));
};

const activateSolution = (inputPath) => {
    const acquiredContent = require('node:fs').readFileSync(inputPath, 'utf8');
    processSystemInput(acquiredContent);
};

activateSolution('/dev/stdin');