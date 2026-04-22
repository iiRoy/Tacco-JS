function processInputDataAlternative(rawInputString) {
    let charIndex = 0;

    function fetchNextNumber() {
        let currentNumberValue = 0;
        let digitEncountered = false;

        while (charIndex < rawInputString.length) {
            const charCode = rawInputString.charCodeAt(charIndex);
            if (charCode >= 48 && charCode <= 57) {
                digitEncountered = true;
                break;
            }
            charIndex++;
        }

        if (!digitEncountered) {
            return null;
        }

        while (charIndex < rawInputString.length) {
            const charCode = rawInputString.charCodeAt(charIndex);
            if (charCode >= 48 && charCode <= 57) {
                currentNumberValue = currentNumberValue * 10 + (charCode - 48);
            } else {
                break;
            }
            charIndex++;
        }
        return currentNumberValue;
    }

    fetchNextNumber();
    fetchNextNumber();

    let numericalSequence = [];
    let currentFetchedValue;
    while ((currentFetchedValue = fetchNextNumber()) !== null) {
        numericalSequence.push(currentFetchedValue);
    }

    let highestElementSeen = 0;
    let cumulativeSum = 0;

    let iterator = 0;
    while (iterator < numericalSequence.length) {
        const itemInSequence = numericalSequence[iterator];
        if (itemInSequence > highestElementSeen) {
            highestElementSeen = itemInSequence;
        }
        cumulativeSum += itemInSequence;
        iterator++;
    }

    let preFinalResult = (2 * highestElementSeen) - 1 - cumulativeSum;
    let finalCalculatedOutcome = (preFinalResult > 0) ? preFinalResult : 0;

    console.log(finalCalculatedOutcome);
}

const dataBlob = require("fs").readFileSync("/dev/stdin", "utf8");
processInputDataAlternative(dataBlob);