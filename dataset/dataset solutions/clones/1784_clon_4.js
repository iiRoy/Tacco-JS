const obtainSourceData = () => {
    const rawContent = require("fs").readFileSync("/dev/stdin", "utf-8").trim();
    const lineSegments = rawContent.split('\n');

    const firstNumericalSequence = lineSegments[0].split(/\s+/).map(Number);
    const rowCount = firstNumericalSequence[0];
    const colCount = firstNumericalSequence[1];
    const maxJumpDistance = firstNumericalSequence[2];

    const secondNumericalSequence = lineSegments[1].split(/\s+/).map(Number);
    const initialRow = secondNumericalSequence[0] - 1;
    const initialCol = secondNumericalSequence[1] - 1;
    const finalRow = secondNumericalSequence[2] - 1;
    const finalCol = secondNumericalSequence[3] - 1;

    const terrainLayout = [];
    for (let currentR = 0; currentR < rowCount; currentR++) {
        terrainLayout.push(lineSegments[currentR + 2].split(''));
    }

    return { rowCount, colCount, maxJumpDistance, initialRow, initialCol, finalRow, finalCol, terrainLayout };
};

(() => {
    const { rowCount, colCount, maxJumpDistance, initialRow, initialCol, finalRow, finalCol, terrainLayout } = obtainSourceData();

    const distanceTraveled = Array.from({ length: rowCount }, () =>
        Array.from({ length: colCount }, () => Infinity)
    );

    distanceTraveled[initialRow][initialCol] = 0;

    const traversalQueue = [[initialRow, initialCol]];
    let queuePointer = 0;

    const displacementVectors = [
        [0, 1],  // East
        [0, -1], // West
        [1, 0],  // South
        [-1, 0]  // North
    ];

    while (queuePointer < traversalQueue.length) {
        const [currentRow, currentCol] = traversalQueue[queuePointer++];
        const currentPathLength = distanceTraveled[currentRow][currentCol];

        if (currentRow === finalRow && currentCol === finalCol) {
            break;
        }

        for (const [deltaR, deltaC] of displacementVectors) {
            for (let stepCount = 1; stepCount <= maxJumpDistance; stepCount++) {
                const nextR = currentRow + deltaR * stepCount;
                const nextC = currentCol + deltaC * stepCount;

                if (nextR < 0 || nextR >= rowCount || nextC < 0 || nextC >= colCount) {
                    break;
                }

                if (terrainLayout[nextR][nextC] === '@') {
                    break;
                }

                if (distanceTraveled[nextR][nextC] === Infinity) {
                    distanceTraveled[nextR][nextC] = currentPathLength + 1;
                    traversalQueue.push([nextR, nextC]);
                }
            }
        }
    }

    const finalResult = distanceTraveled[finalRow][finalCol];
    if (finalResult === Infinity) {
        console.log('-1');
    } else {
        console.log(finalResult);
    }
})();