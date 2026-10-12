const fileSystem = require('fs');

const processInputData = (inputContent) => {
    let inputLines = inputContent.split('\n');
    let currentInputLine;

    while ((currentInputLine = inputLines.shift()) !== undefined) {
        const intervalCount = parseInt(currentInputLine, 10);
        if (intervalCount === 0) break;

        let timeIntervals = [];
        for (let k = 0; k < intervalCount; k++) {
            const lineData = inputLines.shift();
            const intervalPair = lineData.split(' ').map(timeString => {
                return +(new Date('2000-01-01 ' + timeString));
            });
            timeIntervals.push(intervalPair);
        }

        let currentWorkingIntervals = timeIntervals;
        let currentOuterIndex = 0;
        let maxOverlapForCase = 1;

        while (currentOuterIndex < currentWorkingIntervals.length) {
            const primaryInterval = currentWorkingIntervals[currentOuterIndex];
            
            const { overlapTally, nonOverlappingRemainder } = currentWorkingIntervals
                .slice(currentOuterIndex + 1)
                .reduce((accumulator, comparisonInterval) => {
                    if (primaryInterval[1] > comparisonInterval[0] && comparisonInterval[0] > primaryInterval[0]) {
                        accumulator.overlapTally++;
                    } else {
                        accumulator.nonOverlappingRemainder.push(comparisonInterval);
                    }
                    return accumulator;
                }, { overlapTally: 1, nonOverlappingRemainder: [] });

            maxOverlapForCase = Math.max(maxOverlapForCase, overlapTally);
            
            currentWorkingIntervals = [primaryInterval, ...nonOverlappingRemainder];
            
            currentOuterIndex++;
        }
        console.log(maxOverlapForCase);
    }
};

const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
processInputData(rawData);
