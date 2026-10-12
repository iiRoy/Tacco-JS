const parseNumberLine = (lineContent) => lineContent.split(' ').map(strVal => Number(strVal));

function processInputData(rawData) {
    const inputLines = rawData.split('\n');

    const [numA, numB, timeLimit] = parseNumberLine(inputLines[0]);

    const stackA = parseNumberLine(inputLines[1]).reverse();
    const stackB = parseNumberLine(inputLines[2]).reverse();

    let completedReads = 0;
    let totalDuration = 0;

    const getNextAvailableItem = (sourceA, sourceB) => {
        const currentLenA = sourceA.length;
        const currentLenB = sourceB.length;

        if (currentLenA === 0 && currentLenB === 0) {
            return null;
        }

        let selectedValue;
        if (currentLenA === 0) {
            selectedValue = sourceB.pop();
        } else if (currentLenB === 0) {
            selectedValue = sourceA.pop();
        } else {
            const topA = sourceA[currentLenA - 1];
            const topB = sourceB[currentLenB - 1];
            if (topA <= topB) {
                selectedValue = sourceA.pop();
            } else {
                selectedValue = sourceB.pop();
            }
        }
        return selectedValue;
    };

    while (totalDuration <= timeLimit) {
        completedReads++;

        const currentItemDuration = getNextAvailableItem(stackA, stackB);

        if (currentItemDuration === null) {
            break;
        }

        totalDuration += currentItemDuration;
    }

    console.log(completedReads - 1);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
