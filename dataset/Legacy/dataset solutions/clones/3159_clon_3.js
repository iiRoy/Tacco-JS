function attemptPairRemoval(characterArray, currentIndex) {
    if (currentIndex + 1 >= characterArray.length) {
        return false;
    }

    const firstChar = characterArray[currentIndex];
    const secondChar = characterArray[currentIndex + 1];

    const isMatchingPair = (firstChar === "1" && secondChar === "0") ||
                           (firstChar === "0" && secondChar === "1");

    if (isMatchingPair) {
        characterArray.splice(currentIndex, 2);
        return true;
    }
    return false;
}

function processInputString(rawInputString) {
    let currentCharacterArray = rawInputString.split("");
    let totalRemovedPairs = 0;
    let noMoreMatchesFound;

    while (true) {
        noMoreMatchesFound = true;
        let iterationIndex = 0;

        while (iterationIndex < currentCharacterArray.length - 1) {
            const pairWasRemoved = attemptPairRemoval(currentCharacterArray, iterationIndex);

            if (pairWasRemoved) {
                totalRemovedPairs++;
                noMoreMatchesFound = false;
            } else {
                iterationIndex++;
            }
        }

        if (noMoreMatchesFound) {
            break;
        }
    }
    console.log(totalRemovedPairs * 2);
}

processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));
