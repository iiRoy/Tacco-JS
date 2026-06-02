var a;

function searchRecursive(targetValue, currentLeft, currentRight, currentCount) {
    currentCount++;

    if (currentLeft >= currentRight) {
        return currentCount;
    }

    const middleIndex = Math.floor((currentLeft + currentRight) / 2);

    if (a[middleIndex] === targetValue) {
        return currentCount;
    } else if (targetValue < a[middleIndex]) {
        return searchRecursive(targetValue, currentLeft, middleIndex, currentCount);
    } else {
        return searchRecursive(targetValue, middleIndex + 1, currentRight, currentCount);
    }
}

function binarySearch(key) {
    return searchRecursive(key, 0, a.length, 0);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineConsumer = (function* () {
    const allLines = fileContent.trim().split('\n');
    for (const singleLine of allLines) {
        yield singleLine;
    }
})();

while (true) {
    const lineResult = lineConsumer.next();
    if (lineResult.done) {
        break;
    }
    const elementCount = Number(lineResult.value);

    if (elementCount === 0) {
        break;
    }

    a = Array.from({ length: elementCount }, () => Number(lineConsumer.next().value));

    const searchTarget = Number(lineConsumer.next().value);

    console.log(binarySearch(searchTarget));
}
