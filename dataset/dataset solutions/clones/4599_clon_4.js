function newEntry(dataSource) {
    const rawData = require('node:fs').readFileSync(dataSource, 'utf8');
    const processedRaw = rawData.replace(/^\s+|\s+$/g, '');
    const numberFragments = processedRaw.split(/\s+/).map(x => Number(x));

    function extractSuffix(value) {
        // This will throw TypeError if 'value' is a number,
        // mirroring the original's TypeError for `Number.prototype.slice`
        return value.substring(value.length - 1, value.length);
    }

    function extractPrefix(value) {
        // This will throw TypeError if 'value' is a number
        return value.substring(0, 1);
    }

    // These calls will trigger the TypeError on elements of numberFragments
    const conditionA = extractSuffix(numberFragments[0]) === extractPrefix(numberFragments[1]);
    const conditionB = extractSuffix(numberFragments[1]) === extractPrefix(numberFragments[2]);

    if (conditionA && conditionB) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

newEntry('/dev/stdin');