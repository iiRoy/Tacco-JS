const gridProcessor = (inputContent) => {
    const dataLines = inputContent.trim().split('\n');
    const [rowsCount, columnsCount] = dataLines[0].split(' ').map(Number);

    const distanceMetric = Array.from({ length: rowsCount }, () =>
        Array.from({ length: columnsCount }, () => -1)
    );

    const bfsQueue = {
        storage: [],
        front: 0,
        back: 0,
        add: function(element) {
            this.storage[this.back++] = element;
        },
        remove: function() {
            if (this.front === this.back) return undefined;
            const element = this.storage[this.front];
            delete this.storage[this.front];
            this.front++;
            return element;
        },
        isEmpty: function() {
            return this.front === this.back;
        }
    };

    let peakDistance = 0;
    let initialSourcesExist = false;

    for (let rIndex = 0; rIndex < rowsCount; rIndex++) {
        const rowCharacters = dataLines[rIndex + 1].split('');
        for (let cIndex = 0; cIndex < columnsCount; cIndex++) {
            if (rowCharacters[cIndex] === '#') {
                bfsQueue.add({ rCoord: rIndex, cCoord: cIndex, currentLevel: 0 });
                distanceMetric[rIndex][cIndex] = 0;
                initialSourcesExist = true;
            }
        }
    }

    if (!initialSourcesExist && (rowsCount > 0 || columnsCount > 0)) {
        return;
    }

    const movementVectors = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 }
    ];

    while (!bfsQueue.isEmpty()) {
        const { rCoord: currentR, cCoord: currentC, currentLevel: currentL } = bfsQueue.remove();

        peakDistance = Math.max(peakDistance, currentL);

        for (const vector of movementVectors) {
            const nextR = currentR + vector.dr;
            const nextC = currentC + vector.dc;
            const nextL = currentL + 1;

            if (nextR >= 0 && nextR < rowsCount &&
                nextC >= 0 && nextC < columnsCount &&
                distanceMetric[nextR][nextC] === -1) {
                
                distanceMetric[nextR][nextC] = nextL;
                bfsQueue.add({ rCoord: nextR, cCoord: nextC, currentLevel: nextL });
            }
        }
    }

    console.log(peakDistance);
};

try {
    const filesystem = require('fs');
    const inputContentString = filesystem.readFileSync('/dev/stdin', 'UTF-8');
    gridProcessor(inputContentString);
} catch (inputError) {
    throw inputError;
}