function processInputData(rawData) {
    const inputLines = rawData.split('\n');
    const arrayLength = parseInt(inputLines[0], 10);
    const numericSequence = inputLines[1].split(' ').map(Number);

    const isHomogeneous = numericSequence.every(val => val === numericSequence[0]);
    if (isHomogeneous) {
        console.log(Math.floor(numericSequence.length / 2));
        return;
    }

    const firstElementUniqueAmongAll = numericSequence.slice(1).every(val => val !== numericSequence[0]);
    if (firstElementUniqueAmongAll && numericSequence.length >= 4) {
        console.log(Math.floor(numericSequence.length / 2));
        return;
    }

    const { evenPositionTallies, oddPositionTallies } = numericSequence.reduce(
        (accumulator, value, index) => {
            const currentMap = index % 2 === 0 ? accumulator.evenPositionTallies : accumulator.oddPositionTallies;
            currentMap.set(value, (currentMap.get(value) || 0) + 1);
            return accumulator;
        },
        { evenPositionTallies: new Map(), oddPositionTallies: new Map() }
    );

    const calculateMinReplacements = (frequencyMap, segmentTotalElements) => {
        if (frequencyMap.size === 0) {
            return 0;
        }
        const allCounts = Array.from(frequencyMap.values());
        const maximumCount = Math.max(...allCounts);
        return segmentTotalElements - maximumCount;
    };

    const totalEvenSegmentElements = Math.ceil(numericSequence.length / 2);
    const totalOddSegmentElements = Math.floor(numericSequence.length / 2);

    const replacementsForEvenSegment = calculateMinReplacements(evenPositionTallies, totalEvenSegmentElements);
    const replacementsForOddSegment = calculateMinReplacements(oddPositionTallies, totalOddSegmentElements);

    console.log(replacementsForEvenSegment + replacementsForOddSegment);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
