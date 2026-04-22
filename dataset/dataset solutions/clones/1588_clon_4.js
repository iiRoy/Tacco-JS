(async function () {
    let gatheredContent = '';
    process.stdin.on('data', (fragment) => {
        gatheredContent += fragment.toString();
    });

    process.stdin.on('end', () => {
        const entrySegments = gatheredContent.trim().split('\n');
        const [dimensionOne, dimensionTwo, elementCount] = entrySegments[0].split(/\s+/).map(Number.parseInt);

        if (elementCount === 0) {
            process.stdout.write('0\n');
            return;
        }

        const markedPositions = new Set();
        const firstAxisTallies = new Map();
        const secondAxisTallies = new Map();

        for (let positionIndex = 1; positionIndex <= elementCount; ++positionIndex) {
            const [coordinateA, coordinateB] = entrySegments[positionIndex].split(/\s+/).map(value => Number.parseInt(value) - 1);

            markedPositions.add(`${coordinateA},${coordinateB}`);

            firstAxisTallies.set(coordinateA, (firstAxisTallies.get(coordinateA) || 0) + 1);
            secondAxisTallies.set(coordinateB, (secondAxisTallies.get(coordinateB) || 0) + 1);
        }

        const topCountFirstAxis = Array.from(firstAxisTallies.values()).reduce((peak, current) => Math.max(peak, current), 0);
        const topCountSecondAxis = Array.from(secondAxisTallies.values()).reduce((peak, current) => Math.max(peak, current), 0);

        const topIndicesFirstAxis = Array.from(firstAxisTallies.keys()).filter(key => firstAxisTallies.get(key) === topCountFirstAxis);
        const topIndicesSecondAxis = Array.from(secondAxisTallies.keys()).filter(key => secondAxisTallies.get(key) === topCountSecondAxis);

        let deductionValue = 1; 
        
        let voidFound = false;
        for (const rowIdentifier of topIndicesFirstAxis) {
            for (const columnIdentifier of topIndicesSecondAxis) {
                if (!markedPositions.has(`${rowIdentifier},${columnIdentifier}`)) {
                    voidFound = true;
                    break;
                }
            }
            if (voidFound) {
                break;
            }
        }

        if (voidFound) {
            deductionValue = 0;
        }

        process.stdout.write((topCountFirstAxis + topCountSecondAxis - deductionValue).toString() + '\n');
    });
})();