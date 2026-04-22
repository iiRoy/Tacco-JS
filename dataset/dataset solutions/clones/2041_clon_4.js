const verifyPalindromicRecursive = (sequenceList) => {
    const currentLength = sequenceList.length;
    if (currentLength <= 1) {
        return true;
    }
    if (sequenceList[0] !== sequenceList[currentLength - 1]) {
        return false;
    }
    return verifyPalindromicRecursive(sequenceList.slice(1, currentLength - 1));
};

const analyzeString = (incomingDatum) => {
    const characterUnits = incomingDatum.trim().split('');
    const overallSpan = characterUnits.length;

    if (!verifyPalindromicRecursive(characterUnits)) {
        return 'No';
    }

    const firstSubsegmentLimit = Math.floor((overallSpan - 1) / 2);
    const secondSubsegmentOrigin = Math.ceil(((overallSpan + 3) / 2) - 1);

    const initialSection = characterUnits.slice(0, firstSubsegmentLimit);
    if (!verifyPalindromicRecursive(initialSection)) {
        return 'No';
    }

    const finalSection = characterUnits.slice(secondSubsegmentOrigin);
    if (!verifyPalindromicRecursive(finalSection)) {
        return 'No';
    }

    return 'Yes';
};

const interpretInput = (receivedContent) => {
    process.stdout.write(analyzeString(receivedContent));
};

interpretInput(require("fs").readFileSync("/dev/stdin", "utf8"));