function Main(inputContent) {
    const lineSegments = inputContent.split("\n");
    const targetSequence = lineSegments[0].trim();

    if (targetSequence.length < 2) {
        console.log(0);
        return;
    }

    const stateTracker = {
        countOfDifferences: 0,
        previousSymbol: targetSequence[0]
    };

    targetSequence.slice(1).split('').reduce((currentTracker, currentSymbol) => {
        if (currentTracker.previousSymbol !== currentSymbol) {
            currentTracker.countOfDifferences++;
        }
        currentTracker.previousSymbol = currentSymbol;
        return currentTracker;
    }, stateTracker);

    console.log(stateTracker.countOfDifferences);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
