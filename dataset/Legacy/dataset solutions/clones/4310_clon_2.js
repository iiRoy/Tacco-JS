process.stdin.resume();
process.stdin.setEncoding('utf8');

var globalInputBuffer = '';
process.stdin.on('data', function(incomingChunk) {
    globalInputBuffer += incomingChunk;
});

process.stdin.on('end', function() {
    ProcessData(globalInputBuffer.split(/\r?\n/));
});

function ProcessData(inputLines) {

    var countD = parseInt(inputLines[0], 10);
    var dStringArray = inputLines[1].split(' ');
    var dataArrayD = new Array(countD);
    for (var idxA = 0; idxA < countD; idxA++) {
        dataArrayD[idxA] = parseInt(dStringArray[idxA], 10);
    }

    var countT = parseInt(inputLines[2], 10);
    var tStringArray = inputLines[3].split(' ');
    var dataArrayT = new Array(countT);
    for (var idxA = 0; idxA < countT; idxA++) {
        dataArrayT[idxA] = parseInt(tStringArray[idxA], 10);
    }

    dataArrayD.sort(function(valA, valB) {
        if (valA < valB) {
            return -1;
        }
        if (valA > valB) {
            return 1;
        }
        return 0;
    });

    dataArrayT.sort(function(valA, valB) {
        if (valA < valB) {
            return -1;
        }
        if (valA > valB) {
            return 1;
        }
        return 0;
    });

    var matchFound = false;
    for (var idxA = 0, idxB = 0; idxA < countT; idxA++) {
        matchFound = false;
        for (; idxB < countD; idxB++) {
            if (dataArrayT[idxA] === dataArrayD[idxB]) {
                matchFound = true;
                idxB++;
                break;
            }
        }
        if (!matchFound) {
            break;
        }
    }

    if (matchFound) {
        console.log('YES');
    }
    else {
        console.log('NO');
    }

    return 0;
}
