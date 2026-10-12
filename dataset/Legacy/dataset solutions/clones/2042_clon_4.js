function flipText(sourceString) {
    return [...sourceString].reverse().join('');
}

function isSymmetric(candidateString) {
    let leftIndex = 0;
    let rightIndex = candidateString.length - 1;

    while (leftIndex < rightIndex) {
        if (candidateString[leftIndex] !== candidateString[rightIndex]) {
            return false;
        }
        leftIndex++;
        rightIndex--;
    }
    return true;
}

function processInput(rawText) {
    const cleanedText = rawText.trim();
    const midPoint = Math.floor(cleanedText.length / 2);
    const initialSegment = cleanedText.substring(0, midPoint);

    let finalVerdict;
    if (isSymmetric(cleanedText) && isSymmetric(initialSegment)) {
        finalVerdict = "Yes";
    } else {
        finalVerdict = "No";
    }
    console.log(finalVerdict);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
