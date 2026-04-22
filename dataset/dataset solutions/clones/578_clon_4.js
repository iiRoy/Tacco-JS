((inflow) => {
    const rawSegments = inflow.replace(/\r/g, '').split('\n');

    const obtainSubsequences = (sourceSegment) => {
        const collection = [];
        for (let initialPosition = 0; initialPosition < sourceSegment.length; ++initialPosition) {
            for (let finalPosition = initialPosition + 1; finalPosition <= sourceSegment.length; ++finalPosition) {
                collection.push(sourceSegment.substring(initialPosition, finalPosition));
            }
        }
        return collection;
    };

    const processSegmentPair = (firstComponent, secondComponent) => {
        const [shorterComponent, longerComponent] = firstComponent.length < secondComponent.length ? [firstComponent, secondComponent] : [secondComponent, firstComponent];

        const candidateSubstrings = obtainSubsequences(shorterComponent);

        const greatestLength = candidateSubstrings.reduce((currentMaximum, evaluatedSubstring) => {
            if (longerComponent.includes(evaluatedSubstring) && longerComponent.indexOf(evaluatedSubstring) > 0) {
                return Math.max(currentMaximum, evaluatedSubstring.length);
            }
            return currentMaximum;
        }, 0);

        return greatestLength;
    };

    function* segmentStreamGenerator(dataElements) {
        let currentPointer = 0;
        while (true) {
            const elementOne = dataElements[currentPointer];
            if (elementOne === undefined || elementOne === '') {
                return;
            }
            const elementTwo = dataElements[currentPointer + 1];
            yield [elementOne, elementTwo];
            currentPointer += 2;
        }
    }

    const calculatedOutcomes = Array.from(segmentStreamGenerator(rawSegments)).map(([componentA, componentB]) =>
        processSegmentPair(componentA, componentB)
    );

    calculatedOutcomes.forEach(outcomeEntry => console.log(outcomeEntry));

})(require("fs").readFileSync("/dev/stdin", "utf8"));