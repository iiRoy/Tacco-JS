const processInputData = (rawData) => {
    const textLines = rawData.trim().split('\n');
    const stringifiedNumbers = textLines[1].split(' ');
    
    const numericalValues = stringifiedNumbers.map(val => Number(val));

    const runningSums = numericalValues.reduce((accumulator, currentElement) => {
        const previousTotal = accumulator.length > 0 ? accumulator[accumulator.length - 1] : 0;
        accumulator.push(previousTotal + currentElement);
        return accumulator;
    }, [0]);

    const sumOccurrences = runningSums.reduce((frequencyMap, presentSum) => {
        frequencyMap.set(presentSum, (frequencyMap.get(presentSum) || 0) + 1);
        return frequencyMap;
    }, new Map());

    const finalCombinationCount = Array.from(sumOccurrences.values()).reduce((totalCount, currentFrequency) => {
        return totalCount + (currentFrequency * (currentFrequency - 1)) / 2;
    }, 0);
    
    console.log(finalCombinationCount);
};

const acquireExternalContent = () => require('fs').readFileSync('/dev/stdin', 'utf8');

processInputData(acquireExternalContent());