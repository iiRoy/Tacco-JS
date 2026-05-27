function processData(sourceText) {
    const entryPoints = sourceText.split('\n');
    let currentLineIndex = 0;

    while (entryPoints[currentLineIndex] !== "0 0") {
        const [upperBound, desiredTotal] = entryPoints[currentLineIndex].split(" ").map(Number);

        const tally = Array.from({ length: upperBound }, (_, firstElement) => firstElement + 1)
            .flatMap(firstElement =>
                Array.from({ length: upperBound - firstElement }, (_, secondElementIndex) => secondElementIndex + firstElement + 1)
                    .map(secondElement => {
                        const thirdElement = desiredTotal - firstElement - secondElement;
                        return (secondElement < thirdElement && thirdElement <= upperBound) ? 1 : 0;
                    })
            )
            .reduce((total, currentCount) => total + currentCount, 0);

        console.log(tally);
        currentLineIndex++;
    }
}

processData(require("fs").readFileSync("/dev/stdin","utf-8"));
