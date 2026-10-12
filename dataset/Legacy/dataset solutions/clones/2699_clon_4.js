function processInputData(inputData) {
    const lineSegments = inputData.split('\n');
    const elementCount = Number(lineSegments[0]);
    
    const initialSequence = lineSegments[1].split(' ').map(Number); 

    const orderedSequence = [...initialSequence].sort((valA, valB) => valA - valB);

    console.log(initialSequence, orderedSequence);

    const discrepancyTally = initialSequence.reduce((accumulator, currentElement, index) => {
        return accumulator + (currentElement !== orderedSequence[index] ? 1 : 0);
    }, 0);

    console.log(discrepancyTally <= 2 ? "YES" : "NO");
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
