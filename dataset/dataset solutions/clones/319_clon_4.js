const acquiredData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const executeCycle = (dataPile) => {
    const currentLine = dataPile.shift();
    if (currentLine === undefined) {
        return false;
    }

    const quantity = Number(currentLine);
    if (quantity === 0) {
        return false;
    }

    const collectedTags = new Set();

    for (let entryCounter = 0; entryCounter < quantity; ++entryCounter) {
        const entrySegments = dataPile.shift().split(' ');
        const tagIdentifier = entrySegments[0];
        const primaryTerm = entrySegments[1];
        const secondaryTerm = entrySegments[2];

        const calculatedProduct = (BigInt(primaryTerm) * BigInt(secondaryTerm)).toString();

        if (calculatedProduct.length >= 7) {
            collectedTags.add(tagIdentifier);
        }
    }

    if (collectedTags.size === 0) {
        console.log("NA");
    } else {
        Array.from(collectedTags).forEach(label => console.log(label));
    }
    return true;
};

while (executeCycle(acquiredData)) {
    // Continue processing data blocks until a termination condition is met
}