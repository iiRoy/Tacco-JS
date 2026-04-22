const filesystemAccess = require('fs');
const acquiredData = filesystemAccess.readFileSync('/dev/stdin', 'utf8');

const processInputData = (incomingText) => {
    const textLines = incomingText.trim().split('\n');

    const evaluateSpatialRelation = (shapeOne, shapeTwo) => {
        // shapeOne: { xMin, yMin, xMax, yMax }
        // shapeTwo: { xMin, yMin, xMax, yMax }

        const checkHorizontalContact = (s1, s2) => s2.xMax >= s1.xMin && s2.xMin <= s1.xMax;
        const checkVerticalContact = (s1, s2) => s2.yMax >= s1.yMin && s2.yMin <= s1.yMax;

        return checkHorizontalContact(shapeOne, shapeTwo) && checkVerticalContact(shapeOne, shapeTwo);
    };

    const parseLineIntoShapes = (currentLine) => {
        const numericalComponents = currentLine.split(' ').map(val => parseInt(val, 10));
        return {
            firstShape: { xMin: numericalComponents[0], yMin: numericalComponents[1], xMax: numericalComponents[2], yMax: numericalComponents[3] },
            secondShape: { xMin: numericalComponents[4], yMin: numericalComponents[5], xMax: numericalComponents[6], yMax: numericalComponents[7] }
        };
    };

    textLines.map(parseLineIntoShapes)
             .map(shapePair => evaluateSpatialRelation(shapePair.firstShape, shapePair.secondShape))
             .forEach(hasOverlap => {
                 console.log(hasOverlap ? "YES" : "NO");
             });
};

processInputData(acquiredData);