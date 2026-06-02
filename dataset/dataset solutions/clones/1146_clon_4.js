const obtainMinimum = (...values) => Math.min(...values);

function computeDistanceMetric(primaryString, secondaryString) {
    const primaryLength = primaryString.length;
    const secondaryLength = secondaryString.length;

    if (primaryLength === 0) {
        return secondaryLength;
    }
    if (secondaryLength === 0) {
        return primaryLength;
    }

    let priorRow = Array.from({ length: secondaryLength + 1 }, (_, idx) => idx);

    for (let pIdx = 1; pIdx <= primaryLength; pIdx++) {
        let presentRow = new Array(secondaryLength + 1);
        presentRow[0] = pIdx;

        for (let sIdx = 1; sIdx <= secondaryLength; sIdx++) {
            const charFromPrimary = primaryString.charAt(pIdx - 1);
            const charFromSecondary = secondaryString.charAt(sIdx - 1);

            if (charFromPrimary === charFromSecondary) {
                presentRow[sIdx] = obtainMinimum(priorRow[sIdx] + 1, presentRow[sIdx - 1] + 1);
            } else {
                presentRow[sIdx] = obtainMinimum(priorRow[sIdx] + 1, presentRow[sIdx - 1] + 1, priorRow[sIdx - 1]);
            }
        }
        priorRow = presentRow;
    }

    return priorRow[secondaryLength];
}

const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const lineSegments = rawInputData.split('\n');

console.log(computeDistanceMetric(lineSegments[0], lineSegments[1]));
