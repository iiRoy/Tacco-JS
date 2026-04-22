const process = require('process');
const rd = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let collectedLines = [];

rd.on('line', (line) => {
    collectedLines.push(line);
});

rd.on('close', () => {
    processAllScenarios(collectedLines);
});

function processAllScenarios(allInputSegments) {
    let scenarioReadPointer = 0;
    while (scenarioReadPointer < allInputSegments.length) {
        const areaDimensions = allInputSegments[scenarioReadPointer].split(' ').map(Number);
        const mapWidth = areaDimensions[0];
        const mapHeight = areaDimensions[1];
        scenarioReadPointer++;

        if (mapWidth === 0 && mapHeight === 0) {
            break; 
        }

        const mapLayout = [];
        for (let r = 0; r < mapHeight; r++) {
            mapLayout.push(allInputSegments[scenarioReadPointer + r]);
        }
        scenarioReadPointer += mapHeight;

        const outcome = findBestTraversalRoute(mapWidth, mapHeight, mapLayout);
        process.stdout.write(outcome + '\n');
    }
}

function analyzeMapEntities(w, h, fieldRows) {
    let startingPoint = null;
    let endingPoint = null;
    const entityLocations = new Map(); // Map: '1' -> [{x,y}, {x,y}, ...]

    for (let j = 0; j < h; j++) {
        const layoutRow = fieldRows[j];
        for (let i = 0; i < w; i++) {
            const cellContent = layoutRow[i];
            const currentCoordinates = { x: i, y: j };
            if (cellContent === 'S') {
                startingPoint = currentCoordinates;
            } else if (cellContent === 'G') {
                endingPoint = currentCoordinates;
            } else if (cellContent >= '1' && cellContent <= '5') {
                if (!entityLocations.has(cellContent)) {
                    entityLocations.set(cellContent, []);
                }
                entityLocations.get(cellContent).push(currentCoordinates);
            }
        }
    }
    return { startingPoint, endingPoint, entityLocations };
}

function computeSpatialSeparation(coordA, coordB) {
    return Math.abs(coordA.x - coordB.x) + Math.abs(coordA.y - coordB.y);
}

const INFINITE_REACH = 1e9; // A large number to represent unreachable paths

function findBestTraversalRoute(mapW, mapH, mapRows) {
    const { startingPoint, endingPoint, entityLocations } = analyzeMapEntities(mapW, mapH, mapRows);

    let minTotalPassage = INFINITE_REACH;
    let optimalInitialEntity = -1;

    const entityCategories = ['1', '2', '3', '4', '5'];

    for (let initialCategoryIndex = 0; initialCategoryIndex < entityCategories.length; initialCategoryIndex++) {
        const cumulativeDistances = new Map(); // Map<string (category), Array<number (min_dist_to_instance)>>

        // Initialize distances for all entity instances to infinity
        entityCategories.forEach(category => {
            const entityInstances = entityLocations.get(category) || [];
            cumulativeDistances.set(category, Array(entityInstances.length).fill(INFINITE_REACH));
        });

        // First stage: Calculate distances from S to the first chosen entity category
        const firstCategory = entityCategories[initialCategoryIndex];
        const firstCategoryInstances = entityLocations.get(firstCategory) || [];
        const distancesToFirstCategory = cumulativeDistances.get(firstCategory);

        firstCategoryInstances.forEach((entity, entityIndex) => {
            distancesToFirstCategory[entityIndex] = computeSpatialSeparation(startingPoint, entity);
        });

        // Intermediate stages: Propagate distances through the sequence of entity categories
        // S -> Cat_1 -> Cat_2 -> Cat_3 -> Cat_4 -> Cat_5 -> G
        for (let traversalStage = 0; traversalStage < entityCategories.length - 1; traversalStage++) { // 4 transitions (Cat_1->Cat_2, ..., Cat_4->Cat_5)
            const currentSegmentSourceIndex = (initialCategoryIndex + traversalStage) % entityCategories.length;
            const nextSegmentTargetIndex = (initialCategoryIndex + traversalStage + 1) % entityCategories.length;

            const currentSegmentSourceCategory = entityCategories[currentSegmentSourceIndex];
            const nextSegmentTargetCategory = entityCategories[nextSegmentTargetIndex];

            const sourceCategoryEntities = entityLocations.get(currentSegmentSourceCategory) || [];
            const targetCategoryEntities = entityLocations.get(nextSegmentTargetCategory) || [];

            const distancesFromSourceCategory = cumulativeDistances.get(currentSegmentSourceCategory);
            const distancesToTargetCategory = cumulativeDistances.get(nextSegmentTargetCategory);

            sourceCategoryEntities.forEach((currentSourceEntity, currentSourceEntityIndex) => {
                const distanceToSourceEntity = distancesFromSourceCategory[currentSourceEntityIndex];
                if (distanceToSourceEntity === INFINITE_REACH) return; // Unreachable source entity

                targetCategoryEntities.forEach((currentTargetEntity, currentTargetEntityIndex) => {
                    const segmentTravelDistance = computeSpatialSeparation(currentSourceEntity, currentTargetEntity);
                    distancesToTargetCategory[currentTargetEntityIndex] = Math.min(
                        distancesToTargetCategory[currentTargetEntityIndex], 
                        distanceToSourceEntity + segmentTravelDistance
                    );
                });
            });
        }

        // Final stage: Calculate distances from the last entity category to G
        const finalCategoryIndex = (initialCategoryIndex + entityCategories.length - 1) % entityCategories.length;
        const finalCategory = entityCategories[finalCategoryIndex];
        const finalCategoryEntities = entityLocations.get(finalCategory) || [];
        const distancesToFinalCategory = cumulativeDistances.get(finalCategory);

        let currentScenarioMin = INFINITE_REACH;
        finalCategoryEntities.forEach((entity, entityIndex) => {
            const distanceToFinalEntity = distancesToFinalCategory[entityIndex];
            if (distanceToFinalEntity === INFINITE_REACH) return; // Unreachable entity

            const distanceToEndPoint = computeSpatialSeparation(entity, endingPoint);
            currentScenarioMin = Math.min(currentScenarioMin, distanceToFinalEntity + distanceToEndPoint);
        });

        // Update overall minimum
        if (currentScenarioMin < minTotalPassage) {
            minTotalPassage = currentScenarioMin;
            optimalInitialEntity = initialCategoryIndex;
        }
    }

    if (minTotalPassage === INFINITE_REACH) {
        return "NA";
    } else {
        return `${parseInt(entityCategories[optimalInitialEntity])} ${minTotalPassage}`;
    }
}