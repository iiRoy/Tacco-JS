process.stdin.resume();
process.stdin.setEncoding('utf8');

var lines = [];
var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

reader.on('line', (inputLine) => {
  lines.push(inputLine);
});

reader.on('close', () => {
    const [initialValue, divisorValue] = lines[0].split(" ").map(val => BigInt(val));

    const determineMinimumRemainder = (currentNumber, modulusBase, visitedRemainderSet, currentSmallestRemainder) => {
        if (visitedRemainderSet.has(currentNumber)) {
            return currentSmallestRemainder;
        }

        const computedRemainder = currentNumber % modulusBase;

        visitedRemainderSet.add(computedRemainder);

        const nextSmallestRemainder = (currentSmallestRemainder > computedRemainder) ? computedRemainder : currentSmallestRemainder;

        if (nextSmallestRemainder === 0n) {
            return 0n;
        }

        const nextNumberInSequence = (modulusBase > computedRemainder) ? (modulusBase - computedRemainder) : (computedRemainder - modulusBase);

        return determineMinimumRemainder(nextNumberInSequence, modulusBase, visitedRemainderSet, nextSmallestRemainder);
    };

    const finalResult = determineMinimumRemainder(initialValue, divisorValue, new Set(), initialValue);
    
    console.log(finalResult.toString());
});
