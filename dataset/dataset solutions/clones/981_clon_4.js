const fileSettings = { sourcePath: 'tmp', lineSeparator: '\r\n' };
//const fileSettings = { sourcePath: '/dev/stdin', lineSeparator: '\n' };

const rawContent = require('fs').readFileSync(fileSettings.sourcePath, 'ascii');
const contentSegments = rawContent.split(fileSettings.lineSeparator);

const mainString = contentSegments[0];
const queryCount = Number(contentSegments[1]);
const patternList = contentSegments.slice(2, 2 + queryCount);

function locateSubstring(sourceString, targetPattern, alphabetSize, primeModulus) {
    const sourceLen = sourceString.length;
    const targetLen = targetPattern.length;

    if (targetLen === 0) return 1;
    if (sourceLen < targetLen) return 0;

    let powerTerm = 1;
    for (let k = 0; k < targetLen - 1; k++) {
        powerTerm = (powerTerm * alphabetSize) % primeModulus;
    }

    let targetHash = 0;
    let currentWindowHash = 0;

    for (let k = 0; k < targetLen; k++) {
        targetHash = (targetHash * alphabetSize + targetPattern.charCodeAt(k)) % primeModulus;
        currentWindowHash = (currentWindowHash * alphabetSize + sourceString.charCodeAt(k)) % primeModulus;
    }

    for (let windowStart = 0; windowStart <= sourceLen - targetLen; windowStart++) {
        if (targetHash === currentWindowHash) {
            let matchFound = true;
            for (let k = 0; k < targetLen; k++) {
                if (sourceString.charCodeAt(windowStart + k) !== targetPattern.charCodeAt(k)) {
                    matchFound = false;
                    break;
                }
            }
            if (matchFound) {
                return 1;
            }
        }

        if (windowStart < sourceLen - targetLen) {
            currentWindowHash = (alphabetSize * (currentWindowHash - sourceString.charCodeAt(windowStart) * powerTerm) + sourceString.charCodeAt(windowStart + targetLen)) % primeModulus;
            currentWindowHash = (currentWindowHash + primeModulus) % primeModulus;
        }
    }

    return 0;
}

patternList.forEach( (currentPattern) => console.log(locateSubstring(mainString, currentPattern, 256, Math.pow(2, 31) - 1)) );
