process.stdin.resume();
process.stdin.setEncoding('utf8');

var accumulatedInput = '';
process.stdin.on('data', function(chunk) {
    accumulatedInput += chunk;
});

process.stdin.on('end', function() {
    processInputData(accumulatedInput.split(/\r?\n/));
});

function parseNumbersFromLine(lineString) {
    return lineString.split(' ').map(Number);
}

function processInputData(lines) {

    var countD = parseInt(lines[0], 10);
    var dValuesStr = lines[1];
    var arrayD = parseNumbersFromLine(dValuesStr);

    var countT = parseInt(lines[2], 10);
    var tValuesStr = lines[3];
    var arrayT = parseNumbersFromLine(tValuesStr);

    arrayD.sort((a, b) => a - b);

    arrayT.sort((a, b) => a - b);

    var matchFound = false;
    var searchIdx = 0;

    for (var tIdx = 0; tIdx < countT; tIdx++) {
        var currentTValue = arrayT[tIdx];
        matchFound = false;

        while (searchIdx < countD) {
            if (currentTValue === arrayD[searchIdx]) {
                matchFound = true;
                searchIdx++;
                break;
            }
            searchIdx++;
        }

        if (!matchFound) {
            break;
        }
    }

    if (matchFound) {
        console.log('YES');
    } else {
        console.log('NO');
    }

    return 0;
}
