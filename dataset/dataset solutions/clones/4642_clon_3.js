function processInputData(rawData) {
    const lines = rawData.split('\n');

    const numStrings = Number(lines[0]);

    const sortedCharArrays = [];
    for (let idx = 1; idx <= numStrings; idx++) {
        sortedCharArrays.push(lines[idx].split('').sort());
    }

    const initialIntersection = sortedCharArrays.shift();

    function findCommonCharacters(currentIntersectionChars, remainingStringCharLists) {
        if (remainingStringCharLists.length === 0) {
            return currentIntersectionChars;
        }

        const nextStringChars = remainingStringCharLists.shift();

        const intersectionResult = [];
        let ptrCurrent = 0;
        let ptrNext = 0;

        while (ptrCurrent < currentIntersectionChars.length && ptrNext < nextStringChars.length) {
            const charFromCurrent = currentIntersectionChars[ptrCurrent];
            const charFromNext = nextStringChars[ptrNext];

            if (charFromCurrent === charFromNext) {
                intersectionResult.push(charFromCurrent);
                ptrCurrent++;
                ptrNext++;
            } else if (charFromCurrent < charFromNext) {
                ptrCurrent++;
            } else {
                ptrNext++;
            }
        }

        return findCommonCharacters(intersectionResult, remainingStringCharLists);
    }

    const finalCommonChars = findCommonCharacters(initialIntersection, sortedCharArrays);

    if (finalCommonChars.length === 0) {
        console.log();
    } else {
        console.log(finalCommonChars.join(''));
    }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
