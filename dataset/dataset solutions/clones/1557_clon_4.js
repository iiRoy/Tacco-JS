const processInput = (textData) => {
    const dataLines = textData.split('\n');
    const elementPairs = dataLines.map(lineSegment => lineSegment.split(' '));

    const initialStats = { currentTally: 0, elementsTracked: new Set() };

    const finalStats = elementPairs.reduce((accumulator, pairInfo) => {
        const [firstComponent, secondComponent] = pairInfo;
        const { currentTally, elementsTracked } = accumulator;

        const seenOne = elementsTracked.has(firstComponent);
        const seenTwo = elementsTracked.has(secondComponent);

        if (!seenOne && !seenTwo) {
            accumulator.currentTally++;
        }
        
        elementsTracked.add(firstComponent);
        elementsTracked.add(secondComponent);

        return accumulator;
    }, initialStats);

    console.log(finalStats.currentTally);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());