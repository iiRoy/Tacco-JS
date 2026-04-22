// Data structure replication utility
const replicateData = (sourceObject, targetContainer = {}) => {
    const objectToString = Object.prototype.toString;
    const arraySignature = '[object Array]';
    const hasOwnProp = Object.prototype.hasOwnProperty;

    if (sourceObject === null || typeof sourceObject !== 'object') {
        return sourceObject;
    }

    const isSourceArray = objectToString.call(sourceObject) === arraySignature;
    
    if (!targetContainer || (isSourceArray && !Array.isArray(targetContainer)) || (!isSourceArray && Array.isArray(targetContainer))) {
        targetContainer = isSourceArray ? [] : {};
    }

    for (const propKey in sourceObject) {
        if (hasOwnProp.call(sourceObject, propKey)) {
            const currentVal = sourceObject[propKey];

            if (typeof currentVal === 'object' && currentVal !== null) {
                const isCurrentValArray = objectToString.call(currentVal) === arraySignature;
                targetContainer[propKey] = replicateData(currentVal, isCurrentValArray ? [] : {});
            } else {
                targetContainer[propKey] = currentVal;
            }
        }
    }
    return targetContainer;
};

((rawInputData) => {
    class PointCoordinate {
        constructor(xCoord, yCoord) {
            this.x = xCoord;
            this.y = yCoord;
        }
    }

    const transformCoordinates = (pointCollection) => {
        return pointCollection.map(pt => new PointCoordinate(-pt.y, pt.x));
    };

    const comparePointArrays = (firstSet, secondSet) => {
        if (!firstSet || !secondSet || firstSet.length !== secondSet.length) {
            return false;
        }
        for (let idx = 0; idx < firstSet.length; idx++) {
            if (firstSet[idx].x !== secondSet[idx].x || firstSet[idx].y !== secondSet[idx].y) {
                return false;
            }
        }
        return true;
    };

    let inputLines = rawInputData.trim().split('\n');
    let linePointer = 0;

    const getNextInt = () => {
        if (linePointer >= inputLines.length) {
            throw new Error("Input stream exhausted.");
        }
        const value = parseInt(inputLines[linePointer++], 10);
        if (isNaN(value)) {
            throw new Error("Invalid integer format encountered.");
        }
        return value;
    };

    const getNextPointCoords = () => {
        if (linePointer >= inputLines.length) {
            throw new Error("Input stream exhausted.");
        }
        const coords = inputLines[linePointer++].split(' ').map(Number);
        if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
            throw new Error("Malformed point coordinates encountered.");
        }
        return new PointCoordinate(coords[0], coords[1]);
    };

    while (true) {
        const segmentCount = getNextInt();
        if (segmentCount === 0) {
            break;
        }

        const polylineSegments = [];

        for (let i = 0; i < segmentCount; i++) {
            const pointCount = getNextInt();
            
            const firstPoint = getNextPointCoords();
            const originX = firstPoint.x;
            const originY = firstPoint.y;

            const currentPolyline = [];
            currentPolyline.push(new PointCoordinate(0, 0));

            for (let j = 1; j < pointCount; j++) {
                const nextPoint = getNextPointCoords();
                currentPolyline.push(new PointCoordinate(nextPoint.x - originX, nextPoint.y - originY));
            }
            polylineSegments.push(currentPolyline);
        }

        const referenceShape = polylineSegments.shift();

        const reversedReferenceShape = (() => {
            const tempReversed = replicateData(referenceShape).reverse();
            if (tempReversed.length === 0) return [];
            
            const firstPointOfReversed = tempReversed[0];
            const revOriginX = firstPointOfReversed.x;
            const revOriginY = firstPointOfReversed.y;

            return tempReversed.map(pt => new PointCoordinate(pt.x - revOriginX, pt.y - revOriginY));
        })();

        for (let i = 0; i < polylineSegments.length; i++) {
            let currentShape = polylineSegments[i];
            let matchFound = false;

            for (let rotationAttempt = 0; rotationAttempt < 4; rotationAttempt++) {
                if (comparePointArrays(currentShape, referenceShape) || comparePointArrays(currentShape, reversedReferenceShape)) {
                    console.log(i + 1);
                    matchFound = true;
                    break;
                }
                currentShape = transformCoordinates(currentShape);
            }
        }
        console.log("+++++");
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));