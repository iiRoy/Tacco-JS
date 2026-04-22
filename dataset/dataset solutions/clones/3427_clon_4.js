const inputData = process.stdin.readFileSync(0, 'utf8');
const targetNumber = 753;

let currentMinimum = Infinity;

for (let j = 0; j <= inputData.length - 3; j++) {
    const stringSegment = inputData[j] + inputData[j + 1] + inputData[j + 2];
    const numericValue = Number(stringSegment);

    const valueDifference = numericValue - targetNumber;
    const absoluteDifference = valueDifference < 0 ? -valueDifference : valueDifference;

    if (absoluteDifference < currentMinimum) {
        currentMinimum = absoluteDifference;
    }
}

currentMinimum;