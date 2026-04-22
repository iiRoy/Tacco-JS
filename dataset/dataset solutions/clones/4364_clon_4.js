function processData(rawData) {
    const cleanStream = rawData.trim();

    function scanForSpecificChar(currentSegment, startIndex) {
        if (startIndex >= currentSegment.length) {
            return false;
        }
        if (currentSegment.codePointAt(startIndex) === '9'.codePointAt(0)) {
            return true;
        }
        return scanForSpecificChar(currentSegment, startIndex + 1);
    }

    const digitFound = scanForSpecificChar(cleanStream, 0);

    const resultTable = {
        true: 'Yes',
        false: 'No'
    };

    console.log(resultTable[digitFound]);
}

processData(require("fs").readFileSync("/dev/stdin","utf8"));