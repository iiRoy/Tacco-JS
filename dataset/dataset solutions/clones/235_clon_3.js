const GEOMETRIC_INPUT_SOURCE = "/dev/stdin";
const TEXT_DATA_ENCODING = "utf8";
const ORTHO_CHECK_PRECISION = 1e-10;
const ORTHO_RESULT_STRING = 'NO';
const NON_ORTHO_RESULT_STRING = 'YES';

const fileSystemModule = require("fs");

function parseInputCoordinates(rawInputLine) {
    return rawInputLine.split(/\s+/).map(Number);
}

class Vector2D {
    constructor(xCoord, yCoord) {
        this.coordX = xCoord;
        this.coordY = yCoord;
    }

    calculateScalarProduct(otherVec) {
        return (this.coordX * otherVec.coordX) + (this.coordY * otherVec.coordY);
    }

    static createFromPoints(pointAX, pointAY, pointBX, pointBY) {
        return new Vector2D(pointBX - pointAX, pointBY - pointAY);
    }
}

function isMagnitudeEffectivelyZero(valueToCheck, toleranceThreshold) {
    return Math.abs(valueToCheck) < toleranceThreshold;
}

try {
    const fileContentBuffer = fileSystemModule.readFileSync(GEOMETRIC_INPUT_SOURCE);

    let fullTextContent = fileContentBuffer.toString(TEXT_DATA_ENCODING);

    fullTextContent = fullTextContent.trim();

    const individualInputLines = fullTextContent.split('\n');

    const processedResultsCollection = [];

    for (const currentLineData of individualInputLines) {
        if (!currentLineData.trim()) {
            continue;
        }

        const numericalDataPoints = parseInputCoordinates(currentLineData);

        const [x1_val, y1_val, x2_val, y2_val, x3_val, y3_val, x4_val, y4_val] = numericalDataPoints;

        const vectorPrimary = Vector2D.createFromPoints(x1_val, y1_val, x2_val, y2_val);
        
        const vectorSecondary = Vector2D.createFromPoints(x3_val, y3_val, x4_val, y4_val);

        const computedDotProductValue = vectorPrimary.calculateScalarProduct(vectorSecondary);

        const isDotProductNegligible = isMagnitudeEffectivelyZero(computedDotProductValue, ORTHO_CHECK_PRECISION);

        if (isDotProductNegligible) {
            processedResultsCollection.push(ORTHO_RESULT_STRING);
        } else {
            processedResultsCollection.push(NON_ORTHO_RESULT_STRING);
        }
    }

    console.log(processedResultsCollection.join('\n'));

} catch (operationalError) {
    console.error("Critical error during input operation:", operationalError.message);
    process.exit(1); 
}