const processInput = (rawData) => {
    const lines = rawData.split("\n");
    const numericStrings = lines[0].split(" ");
    const leftBound = Number(numericStrings[0]);
    const rightBound = Number(numericStrings[1]);

    if (leftBound * rightBound <= 2019) {
        console.log(leftBound * (leftBound + 1));
        return;
    }

    if (rightBound - leftBound >= 2019) {
        console.log(0);
        return;
    }

    function* remainderSequence(startValue, endValue) {
        for (let firstFactor = startValue; firstFactor < endValue; firstFactor++) {
            for (let secondFactor = firstFactor + 1; secondFactor <= endValue; secondFactor++) {
                yield (firstFactor * secondFactor) % 2019;
            }
        }
    }

    let smallestRemainder = 2019;

    for (const currentRemainder of remainderSequence(leftBound, rightBound)) {
        if (currentRemainder === 0) {
            smallestRemainder = 0;
            break;
        }
        if (currentRemainder < smallestRemainder) {
            smallestRemainder = currentRemainder;
        }
    }

    console.log(smallestRemainder);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
