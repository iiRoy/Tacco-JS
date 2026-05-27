let rawInputBuffer = '';
let bufferPosition = 0;

function scan() {
    return +rawInputBuffer[bufferPosition++];
}

function scan_string() {
    return rawInputBuffer[bufferPosition++];
}

function print(val) {
    console.log(val);
}

function analyzeParentheses(textSegment) {
    let currentOpenCount = 0;
    let requiredOpenForClosing = 0;

    for (const character of textSegment) {
        if (character === '(') {
            currentOpenCount++;
        } else {
            if (currentOpenCount > 0) {
                currentOpenCount--;
            } else {
                requiredOpenForClosing++;
            }
        }
    }
    return { neededClosing: requiredOpenForClosing, neededOpening: currentOpenCount };
}

function orchestrateValidation() {
    const totalStringCount = scan();
    const collectedStrings = [];
    for (let i = 0; i < totalStringCount; i++) {
        collectedStrings.push(scan_string());
    }

    const balanceInformation = collectedStrings.map(analyzeParentheses);

    balanceInformation.sort((segmentA, segmentB) => {
        const netBalanceA = segmentA.neededOpening - segmentA.neededClosing;
        const netBalanceB = segmentB.neededOpening - segmentB.neededClosing;

        if (netBalanceA < 0 && netBalanceB < 0) {
            return segmentA.neededClosing - segmentB.neededClosing;
        }
        return netBalanceB - netBalanceA;
    });

    let currentAccumulatedBalance = 0;
    let sequenceIsFeasible = true;

    for (const segmentBalance of balanceInformation) {
        if (currentAccumulatedBalance < segmentBalance.neededClosing) {
            sequenceIsFeasible = false;
            break;
        }
        currentAccumulatedBalance += (segmentBalance.neededOpening - segmentBalance.neededClosing);
    }

    print(sequenceIsFeasible && currentAccumulatedBalance === 0 ? 'Yes' : 'No');
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    rawInputBuffer += chunk;
});

process.stdin.on('end', function() {
    rawInputBuffer = rawInputBuffer.trim().split(/\s+/);
    orchestrateValidation();
});
