function ProcessInput(rawData) {
    let processedData = rawData.trim().split("\n").map(function(lineStr) { return lineStr.split(" "); });

    let numEntries = parseInt(processedData[0][0], 10);

    let coordinatesAndDirections = [];
    for (let idx = 0; idx < numEntries; idx++) {
        coordinatesAndDirections.push([
            parseInt(processedData[idx + 1][0], 10),
            parseInt(processedData[idx + 1][1], 10),
            processedData[idx + 1][2]
        ]);
    }

    coordinatesAndDirections.sort(function(itemA, itemB) {
        if ((itemA[0] + itemA[1]) < (itemB[0] + itemB[1])) return -1;
        if ((itemA[0] + itemA[1]) > (itemB[0] + itemB[1])) return 1;
        if (itemA[0] < itemB[0]) return -1;
        if (itemA[0] > itemB[0]) return 1;
        return 0;
    });

    let currentGroupValue = -1;
    let lastRelevantCoord;
    let minCollisionTime = Infinity;
    let lastDirection = 'U';

    for (let idx = 0; idx < coordinatesAndDirections.length; idx++) {
        if (currentGroupValue === (coordinatesAndDirections[idx][0] + coordinatesAndDirections[idx][1])) {
            if (lastDirection === 'R') {
                if (coordinatesAndDirections[idx][2] === 'U') {
                    lastDirection = 'U';
                    minCollisionTime = Math.min(minCollisionTime, Math.abs(coordinatesAndDirections[idx][0] - lastRelevantCoord) * 10);
                } else if (coordinatesAndDirections[idx][2] === 'R') {
                    lastRelevantCoord = coordinatesAndDirections[idx][0];
                }
            } else {
                if (coordinatesAndDirections[idx][2] === 'R') {
                    lastDirection = 'R';
                    lastRelevantCoord = coordinatesAndDirections[idx][0];
                }
            }
        } else {
            currentGroupValue = coordinatesAndDirections[idx][0] + coordinatesAndDirections[idx][1];
            if (coordinatesAndDirections[idx][2] === 'R') {
                lastDirection = 'R';
                lastRelevantCoord = coordinatesAndDirections[idx][0];
            } else {
                lastDirection = 'U';
            }
        }
    }

    currentGroupValue = -1;
    lastDirection = 'L';
    for (let idx = 0; idx < coordinatesAndDirections.length; idx++) {
        if (currentGroupValue === (coordinatesAndDirections[idx][0] + coordinatesAndDirections[idx][1])) {
            if (lastDirection === 'D') {
                if (coordinatesAndDirections[idx][2] === 'L') {
                    lastDirection = 'L';
                    minCollisionTime = Math.min(minCollisionTime, Math.abs(coordinatesAndDirections[idx][0] - lastRelevantCoord) * 10);
                } else if (coordinatesAndDirections[idx][2] === 'D') {
                    lastRelevantCoord = coordinatesAndDirections[idx][0];
                }
            } else {
                if (coordinatesAndDirections[idx][2] === 'D') {
                    lastDirection = 'D';
                    lastRelevantCoord = coordinatesAndDirections[idx][0];
                }
            }
        } else {
            currentGroupValue = coordinatesAndDirections[idx][0] + coordinatesAndDirections[idx][1];
            if (coordinatesAndDirections[idx][2] === 'D') {
                lastDirection = 'D';
                lastRelevantCoord = coordinatesAndDirections[idx][0];
            } else {
                lastDirection = 'L';
            }
        }
    }

    coordinatesAndDirections.sort(function(itemA, itemB) {
        if ((itemA[1] - itemA[0]) < (itemB[1] - itemB[0])) return -1;
        if ((itemA[1] - itemA[0]) > (itemB[1] - itemB[0])) return 1;
        if (itemA[0] < itemB[0]) return -1;
        if (itemA[0] > itemB[0]) return 1;
        return 0;
    });

    currentGroupValue = Infinity;
    lastDirection = 'D';
    for (let idx = 0; idx < coordinatesAndDirections.length; idx++) {
        if (currentGroupValue === (coordinatesAndDirections[idx][1] - coordinatesAndDirections[idx][0])) {
            if (lastDirection === 'R') {
                if (coordinatesAndDirections[idx][2] === 'D') {
                    lastDirection = 'D';
                    minCollisionTime = Math.min(minCollisionTime, Math.abs(coordinatesAndDirections[idx][0] - lastRelevantCoord) * 10);
                } else if (coordinatesAndDirections[idx][2] === 'R') {
                    lastRelevantCoord = coordinatesAndDirections[idx][0];
                }
            } else {
                if (coordinatesAndDirections[idx][2] === 'R') {
                    lastDirection = 'R';
                    lastRelevantCoord = coordinatesAndDirections[idx][0];
                }
            }
        } else {
            currentGroupValue = coordinatesAndDirections[idx][1] - coordinatesAndDirections[idx][0];
            if (coordinatesAndDirections[idx][2] === 'R') {
                lastDirection = 'R';
                lastRelevantCoord = coordinatesAndDirections[idx][0];
            } else {
                lastDirection = 'D';
            }
        }
    }

    currentGroupValue = Infinity;
    lastDirection = 'L';
    for (let idx = 0; idx < coordinatesAndDirections.length; idx++) {
        if (currentGroupValue === (coordinatesAndDirections[idx][1] - coordinatesAndDirections[idx][0])) {
            if (lastDirection === 'U') {
                if (coordinatesAndDirections[idx][2] === 'L') {
                    lastDirection = 'L';
                    minCollisionTime = Math.min(minCollisionTime, Math.abs(coordinatesAndDirections[idx][0] - lastRelevantCoord) * 10);
                } else if (coordinatesAndDirections[idx][2] === 'U') {
                    lastRelevantCoord = coordinatesAndDirections[idx][0];
                }
            } else {
                if (coordinatesAndDirections[idx][2] === 'U') {
                    lastDirection = 'U';
                    lastRelevantCoord = coordinatesAndDirections[idx][0];
                }
            }
        } else {
            currentGroupValue = coordinatesAndDirections[idx][1] - coordinatesAndDirections[idx][0];
            if (coordinatesAndDirections[idx][2] === 'U') {
                lastDirection = 'U';
                lastRelevantCoord = coordinatesAndDirections[idx][0];
            } else {
                lastDirection = 'L';
            }
        }
    }

    coordinatesAndDirections.sort(function(itemA, itemB) {
        if (itemA[0] < itemB[0]) return -1;
        if (itemA[0] > itemB[0]) return 1;
        if (itemA[1] < itemB[1]) return -1;
        if (itemA[1] > itemB[1]) return 1;
        return 0;
    });

    currentGroupValue = -1;
    lastDirection = 'D';
    for (let idx = 0; idx < coordinatesAndDirections.length; idx++) {
        if (currentGroupValue === (coordinatesAndDirections[idx][0])) {
            if (lastDirection === 'U') {
                if (coordinatesAndDirections[idx][2] === 'D') {
                    lastDirection = 'D';
                    minCollisionTime = Math.min(minCollisionTime, Math.abs(coordinatesAndDirections[idx][1] - lastRelevantCoord) * 5);
                } else if (coordinatesAndDirections[idx][2] === 'U') {
                    lastRelevantCoord = coordinatesAndDirections[idx][1];
                }
            } else {
                if (coordinatesAndDirections[idx][2] === 'U') {
                    lastDirection = 'U';
                    lastRelevantCoord = coordinatesAndDirections[idx][1];
                }
            }
        } else {
            currentGroupValue = coordinatesAndDirections[idx][0];
            if (coordinatesAndDirections[idx][2] === 'U') {
                lastDirection = 'U';
                lastRelevantCoord = coordinatesAndDirections[idx][1];
            } else {
                lastDirection = 'D';
            }
        }
    }

    coordinatesAndDirections.sort(function(itemA, itemB) {
        if (itemA[1] < itemB[1]) return -1;
        if (itemA[1] > itemB[1]) return 1;
        if (itemA[0] < itemB[0]) return -1;
        if (itemA[0] > itemB[0]) return 1;
        return 0;
    });

    currentGroupValue = -1;
    lastDirection = 'L';
    for (let idx = 0; idx < coordinatesAndDirections.length; idx++) {
        if (currentGroupValue === (coordinatesAndDirections[idx][1])) {
            if (lastDirection === 'R') {
                if (coordinatesAndDirections[idx][2] === 'L') {
                    lastDirection = 'L';
                    minCollisionTime = Math.min(minCollisionTime, Math.abs(coordinatesAndDirections[idx][0] - lastRelevantCoord) * 5);
                } else if (coordinatesAndDirections[idx][2] === 'R') {
                    lastRelevantCoord = coordinatesAndDirections[idx][0];
                }
            } else {
                if (coordinatesAndDirections[idx][2] === 'R') {
                    lastDirection = 'R';
                    lastRelevantCoord = coordinatesAndDirections[idx][0];
                }
            }
        } else {
            currentGroupValue = coordinatesAndDirections[idx][1];
            if (coordinatesAndDirections[idx][2] === 'R') {
                lastDirection = 'R';
                lastRelevantCoord = coordinatesAndDirections[idx][0];
            } else {
                lastDirection = 'L';
            }
        }
    }

    let finalResult = minCollisionTime === Infinity ? "SAFE" : minCollisionTime;
    console.log(finalResult);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
