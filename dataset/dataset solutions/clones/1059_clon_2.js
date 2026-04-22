const appOptions = {
    sourcePath: '/dev/stdin'
   , lineBreakChar: '\n'
};

const inputRawLines = require('fs')
                        .readFileSync(appOptions.sourcePath, 'utf-8')
                        .split(appOptions.lineBreakChar);

const makeCoord = (hVal, vVal) => {
    return { h: hVal, v: vVal };
};

const fractalSegmentGenerator = (pointOne, pointTwo, recursionDepth) => {
    if (recursionDepth === 0) {
        return [];
    }
    
    let angleCosine = Math.cos(Math.PI / 3.00);
    let angleSine = Math.sin(Math.PI / 3.00);

    const firstThirdPoint = makeCoord(
          (2 * pointOne.h + pointTwo.h) / 3.00
        , (2 * pointOne.v + pointTwo.v) / 3.00
    );
    
    const secondThirdPoint = makeCoord(
          (pointOne.h + 2 * pointTwo.h) / 3.00
        , (pointOne.v + 2 * pointTwo.v) / 3.00
    );
    
    const apexPoint = makeCoord(
          (secondThirdPoint.h - firstThirdPoint.h) * angleCosine - (secondThirdPoint.v - firstThirdPoint.v) * angleSine + firstThirdPoint.h
        , (secondThirdPoint.h - firstThirdPoint.h) * angleSine + (secondThirdPoint.v - firstThirdPoint.v) * angleCosine + firstThirdPoint.v
    );
    
    return fractalSegmentGenerator(pointOne, firstThirdPoint, recursionDepth - 1)
                                .concat(firstThirdPoint)
                                .concat(fractalSegmentGenerator(firstThirdPoint, apexPoint, recursionDepth - 1))
                                .concat(apexPoint)
                                .concat(fractalSegmentGenerator(apexPoint, secondThirdPoint, recursionDepth - 1))
                                .concat(secondThirdPoint)
                                .concat(fractalSegmentGenerator(secondThirdPoint, pointTwo, recursionDepth - 1));
};

const generateKochCurve = (depthLevel) => {
    if (depthLevel === 0) {
        return [makeCoord(0.00, 0.00), makeCoord(100.00, 0.00)];
    }
    
    return [makeCoord(0.00, 0.00), ...fractalSegmentGenerator(makeCoord(0.00, 0.00), makeCoord(100.00, 0.00), depthLevel), makeCoord(100.00, 0.00)];
};

generateKochCurve(parseInt(inputRawLines[0]))
    .forEach( (currentPoint) => {
        console.log(currentPoint.h.toFixed(8), currentPoint.v.toFixed(8));
    });