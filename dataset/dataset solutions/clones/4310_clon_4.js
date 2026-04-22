process.stdin.resume();
process.stdin.setEncoding('utf8');

var totalData = '';
process.stdin.on('data', function(segment) {
    totalData += segment;
});

process.stdin.on('end', function() {
    performAnalysis(totalData);
});

function performAnalysis(rawContent) {
    var dataLines = rawContent.split(/\r?\n/);

    var firstQuantity = Number(dataLines[0]);
    var firstStringItems = dataLines[1].split(' ');
    var firstNumericItems = firstStringItems.map(Number);

    var secondQuantity = Number(dataLines[2]);
    var secondStringItems = dataLines[3].split(' ');
    var secondNumericItems = secondStringItems.map(Number);

    var overallResult = verifyMultisetInclusion(firstNumericItems, secondNumericItems);

    if (overallResult) {
        console.log('YES');
    } else {
        console.log('NO');
    }
}

function verifyMultisetInclusion(collectionA, collectionB) {
    var numberCountsA = collectionA.reduce(function(accumulator, currentValue) {
        accumulator[currentValue] = (accumulator[currentValue] || 0) + 1;
        return accumulator;
    }, {});

    var numberCountsB = collectionB.reduce(function(accumulator, currentValue) {
        accumulator[currentValue] = (accumulator[currentValue] || 0) + 1;
        return accumulator;
    }, {});

    for (var keyItem in numberCountsB) {
        if (Object.prototype.hasOwnProperty.call(numberCountsB, keyItem)) {
            var neededCount = numberCountsB[keyItem];
            var availableCount = numberCountsA[keyItem] || 0;

            if (availableCount < neededCount) {
                return false;
            }
        }
    }

    return true;
}