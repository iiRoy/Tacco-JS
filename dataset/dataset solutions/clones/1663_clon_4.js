"use strict";

class DataStreamProcessor {
    constructor(rawData) {
        this.tokens = rawData.split(/\s+/).filter(Boolean);
        this.position = 0;
    }

    retrieveNextNumeric() {
        return Number(this.tokens[this.position++]);
    }

    retrieveNextText() {
        return this.tokens[this.position++];
    }

    retrieveNextLargeInt() {
        return BigInt(this.tokens[this.position++]);
    }

    retrieveNumericSequence(count) {
        const sequence = this.tokens.slice(this.position, this.position + count).map(Number);
        this.position += count;
        return sequence;
    }

    retrieveTextSequence(count) {
        const sequence = this.tokens.slice(this.position, this.position + count);
        this.position += count;
        return sequence;
    }

    // Type IV equivalent for xArray, avoiding eval
    constructMultiDimensionalArray(initialElement, ...dimensions) {
        const buildArray = (dims, currentDepth = 0) => {
            if (currentDepth === dims.length - 1) {
                return Array.from({ length: dims[currentDepth] }, () => initialElement);
            }
            return Array.from({ length: dims[currentDepth] }, () => buildArray(dims, currentDepth + 1));
        };
        return buildArray(dimensions);
    }
}

class PointRecord {
    constructor(xCoord, yCoord, directionChar) {
        this.x = xCoord;
        this.y = yCoord;
        this.dir = directionChar;
        this.sumCoords = xCoord + yCoord;
        this.diffCoords = xCoord - yCoord;
    }
}

function runCollisionAnalysis() {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const processor = new DataStreamProcessor(fileContent);

    const INFINITE_DISTANCE = 1e9;
    const totalPoints = processor.retrieveNextNumeric();
    const allPointRecords = [];

    for (let i = 0; i < totalPoints; i++) {
        const currentX = processor.retrieveNextNumeric();
        const currentY = processor.retrieveNextNumeric();
        const currentDirection = processor.retrieveNextText();
        allPointRecords.push(new PointRecord(currentX, currentY, currentDirection));
    }

    let minimalEncounter = INFINITE_DISTANCE;

    // Generic function to group points and find minimum collision distance
    const evaluateGroupedCollisions = (records, groupingKey, sortingKey, collisionCondition) => {
        const groupedEntities = new Map();
        records.forEach(entity => {
            const key = entity[groupingKey];
            if (!groupedEntities.has(key)) {
                groupedEntities.set(key, []);
            }
            groupedEntities.get(key).push(entity);
        });

        groupedEntities.forEach(group => {
            if (group.length < 2) return;

            group.sort((entityA, entityB) => entityA[sortingKey] - entityB[sortingKey]);

            for (let i = 0; i < group.length - 1; i++) {
                const p1 = group[i];
                const p2 = group[i + 1];

                if (collisionCondition(p1, p2)) {
                    let currentCalculatedDistance;
                    if (groupingKey === 'x' || groupingKey === 'y') { // Straight line collision
                        currentCalculatedDistance = Math.abs(p2[sortingKey] - p1[sortingKey]);
                    } else { // Diagonal collision (Manhattan distance is 2 * |delta_x| or 2 * |delta_y|)
                        currentCalculatedDistance = Math.abs(p2[sortingKey] - p1[sortingKey]) * 2;
                    }
                    minimalEncounter = Math.min(minimalEncounter, currentCalculatedDistance);
                }
            }
        });
    };

    // --- Vertical and Horizontal Collisions (same X or same Y) ---
    // U-D collisions on same X-axis
    evaluateGroupedCollisions(allPointRecords, 'x', 'y', (pA, pB) =>
        (pA.dir === 'U' && pB.dir === 'D') || (pA.dir === 'D' && pB.dir === 'U')
    );
    // R-L collisions on same Y-axis
    evaluateGroupedCollisions(allPointRecords, 'y', 'x', (pA, pB) =>
        (pA.dir === 'R' && pB.dir === 'L') || (pA.dir === 'L' && pB.dir === 'R')
    );

    // --- Diagonal Collisions (same x+y sum) ---
    // U-R and D-L collisions on same x+y diagonal
    evaluateGroupedCollisions(allPointRecords, 'sumCoords', 'x', (pA, pB) =>
        (pA.dir === 'U' && pB.dir === 'R') || (pA.dir === 'R' && pB.dir === 'U') ||
        (pA.dir === 'D' && pB.dir === 'L') || (pA.dir === 'L' && pB.dir === 'D')
    );

    // --- Diagonal Collisions (same x-y difference) ---
    // U-L and R-D collisions on same x-y diagonal
    evaluateGroupedCollisions(allPointRecords, 'diffCoords', 'x', (pA, pB) =>
        (pA.dir === 'U' && pB.dir === 'L') || (pA.dir === 'L' && pB.dir === 'U') ||
        (pA.dir === 'R' && pB.dir === 'D') || (pA.dir === 'D' && pB.dir === 'R')
    );

    return minimalEncounter === INFINITE_DISTANCE ? "SAFE" : minimalEncounter * 5;
}

const finalOutput = runCollisionAnalysis();
if (finalOutput !== undefined) {
    console.log(String(finalOutput));
}
