function processInputData(rawDataString) {
    if (!rawDataString || rawDataString.trim() === "") {
        console.log("SAFE");
        return;
    }

    // Helper function to parse individual entity lines
    const parseEntityLine = (lineContent) => {
        const parts = lineContent.split(" ");
        if (parts.length !== 3) {
            // Log an error or handle malformed line, for now return null
            console.error("Malformed entity line encountered:", lineContent);
            return null;
        }
        return new Entity(
            parseInt(parts[0], 10),
            parseInt(parts[1], 10),
            parts[2]
        );
    };

    // Define a class for better structured data access
    class Entity {
        constructor(xCoord, yCoord, bearing) {
            this.x = xCoord;
            this.y = yCoord;
            this.direction = bearing;
        }

        get sumCoordinates() { return this.x + this.y; }
        get diffCoordinates() { return this.y - this.x; }
    }

    // Parse the entire input
    const inputLines = rawDataString.trim().split("\n");
    const numberOfEntities = parseInt(inputLines[0], 10);
    const allEntities = [];

    // Iterate starting from the second line to get entity data
    for (let currentLineIndex = 1; currentLineIndex <= numberOfEntities; currentLineIndex++) {
        const entityObject = parseEntityLine(inputLines[currentLineIndex]);
        if (entityObject) {
            allEntities.push(entityObject);
        }
    }

    let shortestEncounterDuration = Infinity; // Renamed tmp3 to be more descriptive

    // Helper for calculating collision distance
    const calculateRelativeCollisionDistance = (coordA, coordB, scalingFactor) => {
        return Math.abs(coordA - coordB) * scalingFactor;
    };

    // --- Collision Scan Pass 1: Group by (x + y), then sort by x. Detect R-U interactions. ---
    const sumCoordinatesThenXSort = (entityA, entityB) => {
        const sumA = entityA.sumCoordinates;
        const sumB = entityB.sumCoordinates;
        if (sumA !== sumB) {
            return sumA - sumB;
        }
        return entityA.x - entityB.x;
    };
    let entitiesForPass1 = [...allEntities].sort(sumCoordinatesThenXSort);

    let currentGroupKey1 = -1; // Renamed tmp1
    let previousReferenceX1; // Renamed tmp2
    let activeScanDirection1 = 'U'; // Renamed tmpAngle

    for (const currentItem of entitiesForPass1) {
        const itemSum = currentItem.sumCoordinates;
        const itemDirection = currentItem.direction;
        const itemX = currentItem.x;

        if (currentGroupKey1 === itemSum) {
            // Inside the same group
            if (activeScanDirection1 === 'R') {
                if (itemDirection === 'U') {
                    activeScanDirection1 = 'U'; // Direction switches to U
                    shortestEncounterDuration = Math.min(shortestEncounterDuration, calculateRelativeCollisionDistance(itemX, previousReferenceX1, 10));
                } else if (itemDirection === 'R') {
                    previousReferenceX1 = itemX; // Update reference for R
                }
            } else { // activeScanDirection1 is 'U' or initially undefined
                if (itemDirection === 'R') {
                    activeScanDirection1 = 'R'; // First R in group
                    previousReferenceX1 = itemX;
                }
            }
        } else {
            // New group starts
            currentGroupKey1 = itemSum;
            if (itemDirection === 'R') {
                activeScanDirection1 = 'R';
                previousReferenceX1 = itemX;
            } else {
                activeScanDirection1 = 'U'; // Default for new group
            }
        }
    }

    // --- Collision Scan Pass 2: Group by (x + y), then sort by x. Detect D-L interactions. ---
    // Re-sort (or simply use the already sorted array if it was mutable)
    let entitiesForPass2 = [...allEntities].sort(sumCoordinatesThenXSort);

    let currentGroupKey2 = -1;
    let previousReferenceX2;
    let activeScanDirection2 = 'L';

    for (const currentItem of entitiesForPass2) {
        const itemSum = currentItem.sumCoordinates;
        const itemDirection = currentItem.direction;
        const itemX = currentItem.x;

        if (currentGroupKey2 === itemSum) {
            const wasPreviousDirectionDown = (activeScanDirection2 === 'D');
            if (wasPreviousDirectionDown) {
                if (itemDirection === 'L') {
                    activeScanDirection2 = 'L';
                    shortestEncounterDuration = Math.min(shortestEncounterDuration, calculateRelativeCollisionDistance(itemX, previousReferenceX2, 10));
                } else if (itemDirection === 'D') {
                    previousReferenceX2 = itemX;
                }
            } else { // Previous direction was 'L' or other
                if (itemDirection === 'D') {
                    activeScanDirection2 = 'D';
                    previousReferenceX2 = itemX;
                }
            }
        } else {
            currentGroupKey2 = itemSum;
            if (itemDirection === 'D') {
                activeScanDirection2 = 'D';
                previousReferenceX2 = itemX;
            } else {
                activeScanDirection2 = 'L';
            }
        }
    }

    // --- Collision Scan Pass 3: Group by (y - x), then sort by x. Detect R-D interactions. ---
    const diffCoordinatesThenXSort = (entityA, entityB) => {
        const diffA = entityA.diffCoordinates;
        const diffB = entityB.diffCoordinates;
        if (diffA !== diffB) {
            return diffA - diffB;
        }
        return entityA.x - entityB.x;
    };
    let entitiesForPass3 = [...allEntities].sort(diffCoordinatesThenXSort);

    let currentGroupKey3 = Infinity; // Initial value differs here
    let previousReferenceX3;
    let activeScanDirection3 = 'D';

    for (const currentItem of entitiesForPass3) {
        const itemDiff = currentItem.diffCoordinates;
        const itemDirection = currentItem.direction;
        const itemX = currentItem.x;

        if (currentGroupKey3 === itemDiff) {
            if (activeScanDirection3 === 'R') {
                if (itemDirection === 'D') {
                    activeScanDirection3 = 'D';
                    shortestEncounterDuration = Math.min(shortestEncounterDuration, calculateRelativeCollisionDistance(itemX, previousReferenceX3, 10));
                } else if (itemDirection === 'R') {
                    previousReferenceX3 = itemX;
                }
            } else { // activeScanDirection3 is 'D' or other
                if (itemDirection === 'R') {
                    activeScanDirection3 = 'R';
                    previousReferenceX3 = itemX;
                }
            }
        } else {
            currentGroupKey3 = itemDiff;
            if (itemDirection === 'R') {
                activeScanDirection3 = 'R';
                previousReferenceX3 = itemX;
            } else {
                activeScanDirection3 = 'D';
            }
        }
    }

    // --- Collision Scan Pass 4: Group by (y - x), then sort by x. Detect U-L interactions. ---
    let entitiesForPass4 = [...allEntities].sort(diffCoordinatesThenXSort);

    let currentGroupKey4 = Infinity;
    let previousReferenceX4;
    let activeScanDirection4 = 'L';

    for (const currentItem of entitiesForPass4) {
        const itemDiff = currentItem.diffCoordinates;
        const itemDirection = currentItem.direction;
        const itemX = currentItem.x;

        if (currentGroupKey4 === itemDiff) {
            // Using a switch statement for alternative conditional structure (Type III)
            switch (activeScanDirection4) {
                case 'U':
                    if (itemDirection === 'L') {
                        activeScanDirection4 = 'L';
                        shortestEncounterDuration = Math.min(shortestEncounterDuration, calculateRelativeCollisionDistance(itemX, previousReferenceX4, 10));
                    } else if (itemDirection === 'U') {
                        previousReferenceX4 = itemX;
                    }
                    break;
                default: // activeScanDirection4 is 'L' or other
                    if (itemDirection === 'U') {
                        activeScanDirection4 = 'U';
                        previousReferenceX4 = itemX;
                    }
                    break;
            }
        } else {
            currentGroupKey4 = itemDiff;
            if (itemDirection === 'U') {
                activeScanDirection4 = 'U';
                previousReferenceX4 = itemX;
            } else {
                activeScanDirection4 = 'L';
            }
        }
    }

    // --- Collision Scan Pass 5: Group by x, then sort by y. Detect U-D interactions. ---
    const xCoordinatesThenYSort = (entityA, entityB) => {
        if (entityA.x !== entityB.x) {
            return entityA.x - entityB.x;
        }
        return entityA.y - entityB.y;
    };
    let entitiesForPass5 = [...allEntities].sort(xCoordinatesThenYSort);

    let currentGroupKey5 = -1;
    let previousReferenceY5; // Reference uses Y coordinate here
    let activeScanDirection5 = 'D';

    for (const currentItem of entitiesForPass5) {
        const itemX = currentItem.x;
        const itemY = currentItem.y;
        const itemDirection = currentItem.direction;

        if (currentGroupKey5 === itemX) { // Grouping by X coordinate
            if (activeScanDirection5 === 'U') {
                if (itemDirection === 'D') {
                    activeScanDirection5 = 'D';
                    shortestEncounterDuration = Math.min(shortestEncounterDuration, calculateRelativeCollisionDistance(itemY, previousReferenceY5, 5)); // Factor 5
                } else if (itemDirection === 'U') {
                    previousReferenceY5 = itemY;
                }
            } else { // activeScanDirection5 is 'D' or other
                if (itemDirection === 'U') {
                    activeScanDirection5 = 'U';
                    previousReferenceY5 = itemY;
                }
            }
        } else {
            currentGroupKey5 = itemX;
            if (itemDirection === 'U') {
                activeScanDirection5 = 'U';
                previousReferenceY5 = itemY;
            } else {
                activeScanDirection5 = 'D';
            }
        }
    }

    // --- Collision Scan Pass 6: Group by y, then sort by x. Detect R-L interactions. ---
    const yCoordinatesThenXSort = (entityA, entityB) => {
        if (entityA.y !== entityB.y) {
            return entityA.y - entityB.y;
        }
        return entityA.x - entityB.x;
    };
    let entitiesForPass6 = [...allEntities].sort(yCoordinatesThenXSort);

    let currentGroupKey6 = -1;
    let previousReferenceX6; // Reference uses X coordinate here
    let activeScanDirection6 = 'L';

    for (const currentItem of entitiesForPass6) {
        const itemX = currentItem.x;
        const itemY = currentItem.y;
        const itemDirection = currentItem.direction;

        if (currentGroupKey6 === itemY) { // Grouping by Y coordinate
            if (activeScanDirection6 === 'R') {
                if (itemDirection === 'L') {
                    activeScanDirection6 = 'L';
                    shortestEncounterDuration = Math.min(shortestEncounterDuration, calculateRelativeCollisionDistance(itemX, previousReferenceX6, 5)); // Factor 5
                } else if (itemDirection === 'R') {
                    previousReferenceX6 = itemX;
                }
            } else { // activeScanDirection6 is 'L' or other
                if (itemDirection === 'R') {
                    activeScanDirection6 = 'R';
                    previousReferenceX6 = itemX;
                }
            }
        } else {
            // NOTE: The original code's `tmp1 = arr_XYU[i][0]` here seems inconsistent
            // with `if (tmp1 === (arr_XYU[i][1]))`. Cloning the original behavior.
            currentGroupKey6 = itemX; // Original behavior: updates with X, compares with Y
            if (itemDirection === 'R') {
                activeScanDirection6 = 'R';
                previousReferenceX6 = itemX;
            } else {
                activeScanDirection6 = 'L';
            }
        }
    }

    // Determine the final result
    const collisionResult = (shortestEncounterDuration === Infinity) ? "SAFE" : shortestEncounterDuration;
    console.log(collisionResult);
}

// Wrapper to handle input/output environment
(function() {
    const fileSystemModule = require("fs");
    const standardInputPath = "/dev/stdin";
    const rawInputData = fileSystemModule.readFileSync(standardInputPath, "utf8");
    processInputData(rawInputData);
})();