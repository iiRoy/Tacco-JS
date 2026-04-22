const retrieveNearestPermissible = (currentIteration, baseNumber, excludedElements) => {
    if (currentIteration > 100) {
        return 'error';
    }

    const lowerCandidate = baseNumber - currentIteration;
    const upperCandidate = baseNumber + currentIteration;

    if (!excludedElements.has(String(lowerCandidate))) {
        return lowerCandidate;
    } else if (!excludedElements.has(String(upperCandidate))) {
        return upperCandidate;
    } else {
        return retrieveNearestPermissible(currentIteration + 1, baseNumber, excludedElements);
    }
};

const executeSearch = (rawInput) => {
    const [lineA, ...otherLines] = rawInput.trim().split('\n');
    const [primeValueStr, conditionMarkerStr] = lineA.split(/\s+/);
    const prohibitedSet = new Set(otherLines.flatMap(l => l.split(/\s+/)).filter(Boolean));

    const primeValue = Number(primeValueStr);

    if (conditionMarkerStr === '0') {
        return primeValue;
    }

    return retrieveNearestPermissible(1, primeValue, prohibitedSet);
};

const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
const finalResult = executeSearch(inputSource);
console.log(finalResult);