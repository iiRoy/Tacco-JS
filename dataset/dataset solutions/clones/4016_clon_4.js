function processInput(inputData) {
    const inputLines = inputData.split('\n');

    const [hStr, wStr, sStr] = inputLines[0].split(' ');
    const h = Number(hStr);
    const w = Number(wStr);
    const s = Number(sStr);

    const coordMap = new Map();
    let maxGridValue = 0;

    for (let r = 1; r <= h; r++) {
        inputLines[r].split(' ').forEach((valStr, c) => {
            const numVal = Number(valStr);
            coordMap.set(numVal, { r: r, c: c + 1 });
            if (numVal > maxGridValue) {
                maxGridValue = numVal;
            }
        });
    }

    const examCount = Number(inputLines[h + 1]);
    const queryList = [];
    let maxQueryEndValue = 0;

    for (let i = 0; i < examCount; i++) {
        const [startStr, endStr] = inputLines[h + 2 + i].split(' ');
        const initialVal = Number(startStr);
        const finalVal = Number(endStr);
        queryList.push({ initial: initialVal, final: finalVal });
        if (finalVal > maxQueryEndValue) {
            maxQueryEndValue = finalVal;
        }
    }

    const overallMaxRelevantValue = Math.max(maxGridValue, maxQueryEndValue);

    const stepDistances = new Map(); // Stores distance from N to N+s
    for (let currentNum = 1; currentNum <= overallMaxRelevantValue - s; currentNum++) {
        if (coordMap.has(currentNum) && coordMap.has(currentNum + s)) {
            const p1 = coordMap.get(currentNum);
            const p2 = coordMap.get(currentNum + s);
            const dist = Math.abs(p2.r - p1.r) + Math.abs(p2.c - p1.c);
            stepDistances.set(currentNum, dist);
        }
    }

    const pathMemo = new Map(); // Stores Map<start, Map<end, cumulativeDistance>>
    const resultCollector = [];

    for (const { initial: initialVal, final: finalVal } of queryList) {
        if (!pathMemo.has(initialVal)) {
            pathMemo.set(initialVal, new Map());
        }
        const innerMemo = pathMemo.get(initialVal);

        if (innerMemo.has(finalVal)) {
            resultCollector.push(innerMemo.get(finalVal));
            continue;
        }

        let currentAccumulatedDistance = 0;
        let currentIterVal = initialVal;

        while (currentIterVal < finalVal) {
            const nextIterVal = currentIterVal + s;

            if (innerMemo.has(nextIterVal)) {
                currentAccumulatedDistance = innerMemo.get(nextIterVal);
                currentIterVal = nextIterVal;
                continue;
            }

            const segmentLength = stepDistances.get(currentIterVal);
            currentAccumulatedDistance += segmentLength;
            innerMemo.set(nextIterVal, currentAccumulatedDistance);
            currentIterVal = nextIterVal;
        }
        resultCollector.push(currentAccumulatedDistance);
    }

    console.log(resultCollector.join('\n'));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
