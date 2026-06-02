const fileSystemModule = require('fs');
const rawDataContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const dataLines = rawDataContent.trim().split('\n');

for (const currentInputLine of dataLines) {
    const parsedNumbers = currentInputLine.split(' ').map(Number);
    const upperLimit = parsedNumbers[0];
    const desiredSum = parsedNumbers[1];

    if (upperLimit === 0 && desiredSum === 0) {
        break;
    }

    let validCombinationCount = 0;

    for (let firstElement = 1; firstElement <= upperLimit; firstElement++) {
        // Calculate the minimum possible value for thirdElement
        // It must be at least firstElement + 2 (to allow for secondElement > firstElement)
        // And it must satisfy secondElement < thirdElement, which means desiredSum - firstElement - thirdElement < thirdElement
        // => desiredSum - firstElement < 2 * thirdElement
        // => thirdElement > (desiredSum - firstElement) / 2
        const minThirdElement = Math.max(firstElement + 2, Math.floor((desiredSum - firstElement) / 2) + 1);

        // Calculate the maximum possible value for thirdElement
        // It must be at most upperLimit
        // And it must satisfy secondElement > firstElement, which means desiredSum - firstElement - thirdElement > firstElement
        // => desiredSum - 2 * firstElement > thirdElement
        // => thirdElement < desiredSum - 2 * firstElement
        const maxThirdElement = Math.min(upperLimit, desiredSum - 2 * firstElement - 1);

        // If the calculated minimum is greater than the maximum, no valid thirdElement exists for this firstElement
        if (minThirdElement > maxThirdElement) {
            continue;
        }

        // Iterate through valid thirdElement values.
        // For each (firstElement, thirdElement) pair, secondElement is uniquely determined.
        // The loop bounds for thirdElement ensure that firstElement < secondElement < thirdElement.
        validCombinationCount += (maxThirdElement - minThirdElement + 1);
    }
    console.log(validCombinationCount);
}
