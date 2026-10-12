function runProgram() {
    const countA = nextValue();
    const countB = nextValue();

    const leftWeights = Array(countA);
    for (let i = 0; i < countA; i++) {
        leftWeights[i] = nextValue();
    }

    const rightWeights = Array(countB);
    for (let i = 0; i < countB; i++) {
        rightWeights[i] = nextValue();
    }

    const frontier = new Map();
    frontier.set(0, 0);
    for (let used = 1; used <= countA; used++) {
        frontier.set(used, Infinity);
    }

    for (let slot = 0; slot < countB; slot++) {
        for (let used = countA; used >= 1; used--) {
            const skipThisSlot = frontier.get(used);
            const arriveByTaking = frontier.get(used - 1) + leftWeights[used - 1] * rightWeights[slot];
            frontier.set(used, Math.min(skipThisSlot, arriveByTaking));
        }
    }

    write(frontier.get(countA));
}

let rawInput = '';
let readPosition = 0;

function nextValue(kind) {
    if (kind === 'string') {
        return rawInput[readPosition++];
    }
    return +rawInput[readPosition++];
}

function write(value) {
    console.log(value);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
    rawInput += chunk;
});
process.stdin.on('end', function () {
    rawInput = rawInput.split(/\s+/);
    runProgram();
});
