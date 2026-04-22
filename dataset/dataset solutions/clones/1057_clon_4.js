const ROTATION_COSINE = Math.cos(Math.PI / 3);
const ROTATION_SINE = Math.sin(Math.PI / 3);

function outputFormattedCoordinates(coordinatePair) {
    console.log(coordinatePair[0].toFixed(8) + ' ' + coordinatePair[1].toFixed(8));
}

(function fractalProcessor() {
    const recursionDepth = Number(require('fs').readFileSync('/dev/stdin', 'utf8').trim());

    let startPosition = [0, 0];
    let endPosition = [100, 0];

    outputFormattedCoordinates(startPosition);

    const operationStack = [{
        depth: recursionDepth,
        startPt: startPosition,
        endPt: endPosition,
        phase: 0,
        firstSegEnd: null,
        secondSegEnd: null,
        triangleTop: null
    }];

    while (operationStack.length > 0) {
        let currentOperation = operationStack[operationStack.length - 1];

        if (currentOperation.depth === 0) {
            operationStack.pop();
            continue;
        }

        switch (currentOperation.phase) {
            case 0:
                let spanX = currentOperation.endPt[0] - currentOperation.startPt[0];
                let spanY = currentOperation.endPt[1] - currentOperation.startPt[1];

                currentOperation.firstSegEnd = [
                    currentOperation.startPt[0] + spanX / 3,
                    currentOperation.startPt[1] + spanY / 3
                ];
                currentOperation.secondSegEnd = [
                    currentOperation.startPt[0] + spanX * 2 / 3,
                    currentOperation.startPt[1] + spanY * 2 / 3
                ];

                let vectorX = currentOperation.secondSegEnd[0] - currentOperation.firstSegEnd[0];
                let vectorY = currentOperation.secondSegEnd[1] - currentOperation.firstSegEnd[1];
                currentOperation.triangleTop = [
                    vectorX * ROTATION_COSINE - vectorY * ROTATION_SINE + currentOperation.firstSegEnd[0],
                    vectorX * ROTATION_SINE + vectorY * ROTATION_COSINE + currentOperation.firstSegEnd[1]
                ];

                operationStack.push({
                    depth: currentOperation.depth - 1,
                    startPt: currentOperation.startPt,
                    endPt: currentOperation.firstSegEnd,
                    phase: 0
                });
                currentOperation.phase = 1;
                break;

            case 1:
                outputFormattedCoordinates(currentOperation.firstSegEnd);
                operationStack.push({
                    depth: currentOperation.depth - 1,
                    startPt: currentOperation.firstSegEnd,
                    endPt: currentOperation.triangleTop,
                    phase: 0
                });
                currentOperation.phase = 2;
                break;

            case 2:
                outputFormattedCoordinates(currentOperation.triangleTop);
                operationStack.push({
                    depth: currentOperation.depth - 1,
                    startPt: currentOperation.triangleTop,
                    endPt: currentOperation.secondSegEnd,
                    phase: 0
                });
                currentOperation.phase = 3;
                break;

            case 3:
                outputFormattedCoordinates(currentOperation.secondSegEnd);
                operationStack.push({
                    depth: currentOperation.depth - 1,
                    startPt: currentOperation.secondSegEnd,
                    endPt: currentOperation.endPt,
                    phase: 0
                });
                currentOperation.phase = 4;
                break;

            case 4:
                operationStack.pop();
                break;
        }
    }

    outputFormattedCoordinates(endPosition);
})();