const calculateTargetValue = (totalPoints, currentLinkCount) => {
    const derivedFactor = totalPoints - currentLinkCount + 2;
    return (derivedFactor - 1) * (derivedFactor - 2) / 2 + currentLinkCount - 2;
};

const initiateGraphConstruction = () => {
    let collectedData = '';
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    const dataAccumulator = (chunk) => {
        collectedData += chunk;
    };

    const processFinalData = () => {
        const inputLines = collectedData.trim().split('\n');
        const [nodeCount, requiredDisjointPairs] = inputLines[0].split(' ').map(Number);

        let chosenLinkCount = null;
        
        // Generate a sequence of possible link counts from nodeCount down to 0
        const potentialLinkCounts = Array.from({ length: nodeCount + 1 }, (_, idx) => nodeCount - idx);

        // Find the first link count that satisfies the condition using a functional approach
        const foundLinkCount = potentialLinkCounts.find(
            (candidate) => calculateTargetValue(nodeCount, candidate) === requiredDisjointPairs
        );

        if (foundLinkCount !== undefined) {
            chosenLinkCount = foundLinkCount;
        }

        if (chosenLinkCount === null) {
            console.log(-1);
            return;
        }

        // Output the total number of connections
        console.log(nodeCount - 1);

        // Generate and output the initial chain connections using a functional approach
        Array.from({ length: chosenLinkCount - 1 }, (_, index) => index + 1)
            .forEach(firstVertex => console.log(`${firstVertex} ${firstVertex + 1}`));

        // Generate and output the star-like connections using a functional approach
        Array.from({ length: nodeCount - chosenLinkCount }, (_, index) => chosenLinkCount + 1 + index)
            .forEach(connectedVertex => console.log(`${1} ${connectedVertex}`));
    };

    process.stdin.on('data', dataAccumulator);
    process.stdin.on('end', processFinalData);
};

initiateGraphConstruction();