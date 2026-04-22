function entryPoint(sourceData) {
    const dataLines = sourceData.split('\n');
    const coordinateCount = Number(dataLines[0]); 
    
    const pointCollection = dataLines.slice(1, 1 + coordinateCount).map(lineText => {
        const parts = lineText.split(' ').map(Number);
        return { h: parts[0], v: parts[1] };
    });

    let finalAnswer = 0;

    const calcSquaredDist = (pt1, pt2) => {
        const deltaH = pt1.h - pt2.h;
        const deltaV = pt1.v - pt2.v;
        return deltaH * deltaH + deltaV * deltaV;
    };

    const deriveCandidateCircle = (aPoint, bPoint, cPoint) => {
        const sqLenAB = calcSquaredDist(aPoint, bPoint);
        const sqLenAC = calcSquaredDist(aPoint, cPoint);
        const sqLenBC = calcSquaredDist(bPoint, cPoint);

        const sideData = [
            { sqLength: sqLenAB, ends: [aPoint, bPoint] },
            { sqLength: sqLenAC, ends: [aPoint, cPoint] },
            { sqLength: sqLenBC, ends: [bPoint, cPoint] }
        ].sort((s1, s2) => s2.sqLength - s1.sqLength);

        let currentCenterX, currentCenterY, currentRadiusSq;

        if (sideData[0].sqLength > sideData[1].sqLength + sideData[2].sqLength) {
            const end1 = sideData[0].ends[0];
            const end2 = sideData[0].ends[1];
            currentCenterX = (end1.h + end2.h) / 2;
            currentCenterY = (end1.v + end2.v) / 2;
            currentRadiusSq = calcSquaredDist(end1, { h: currentCenterX, v: currentCenterY });
        } else {
            const h1 = aPoint.h, v1 = aPoint.v;
            const h2 = bPoint.h, v2 = bPoint.v;
            const h3 = cPoint.h, v3 = cPoint.v;

            const circumDenom = 2 * (h1 * (v2 - v3) + h2 * (v3 - v1) + h3 * (v1 - v2));

            if (Math.abs(circumDenom) < 1e-9) { 
                return null; 
            }

            const h1SqSum = h1 * h1 + v1 * v1;
            const h2SqSum = h2 * h2 + v2 * v2;
            const h3SqSum = h3 * h3 + v3 * v3;

            currentCenterX = (h1SqSum * (v2 - v3) + h2SqSum * (v3 - v1) + h3SqSum * (v1 - v2)) / circumDenom;
            currentCenterY = (h1SqSum * (h3 - h2) + h2SqSum * (h1 - h3) + h3SqSum * (h2 - h1)) / circumDenom;
            currentRadiusSq = calcSquaredDist(aPoint, { h: currentCenterX, v: currentCenterY });
        }
        return { centralH: currentCenterX, centralV: currentCenterY, radiusSquared: currentRadiusSq };
    };

    const checkAllPointsWithin = (allCoords, circleH, circleV, circleRadSq) => {
        return allCoords.every(currentPt => {
            const distFromCenterSq = calcSquaredDist(currentPt, { h: circleH, v: circleV });
            return distFromCenterSq <= circleRadSq + 1e-6; 
        });
    };

    if (coordinateCount === 2) {
        finalAnswer = Math.sqrt(calcSquaredDist(pointCollection[0], pointCollection[1])) / 2;
    } else {
        loop_i:
        for (let idx1 = 0; idx1 < coordinateCount; idx1++) {
            for (let idx2 = idx1 + 1; idx2 < coordinateCount; idx2++) {
                for (let idx3 = idx2 + 1; idx3 < coordinateCount; idx3++) {
                    const pt1 = pointCollection[idx1];
                    const pt2 = pointCollection[idx2];
                    const pt3 = pointCollection[idx3];

                    const potentialCircle = deriveCandidateCircle(pt1, pt2, pt3);

                    if (potentialCircle && 
                        checkAllPointsWithin(pointCollection, potentialCircle.centralH, potentialCircle.centralV, potentialCircle.radiusSquared)) {
                        
                        finalAnswer = Math.sqrt(potentialCircle.radiusSquared);
                        break loop_i;
                    }
                }
            }
        }
    }
    
    process.stdout.write(String(finalAnswer));
    return finalAnswer;
}

const processInputAndCompute = (inputString) => {
    return entryPoint(inputString);
};

if (typeof require !== 'undefined' && require.main === module) {
    processInputAndCompute(require('fs').readFileSync('/dev/stdin', 'utf8'));
}