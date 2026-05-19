process.stdin.resume();
process.stdin.setEncoding('utf8');

var g_input = '';
process.stdin.on('data', function(chunk) {
    g_input += chunk;
});

process.stdin.on('end', function() {
    Main(g_input.split(/\r?\n/));
});

function calculatePalindromeCost(subjectString, leftPointer, rightPointer, currentAccumulatedCost) {
    if (leftPointer >= rightPointer) {
        return currentAccumulatedCost;
    }

    const characterAtLeft = subjectString.charAt(leftPointer);
    const characterAtRight = subjectString.charAt(rightPointer);

    if (characterAtLeft === characterAtRight) {
        return calculatePalindromeCost(subjectString, leftPointer + 1, rightPointer - 1, currentAccumulatedCost);
    } else if (characterAtLeft === 'x') {
        return calculatePalindromeCost(subjectString, leftPointer + 1, rightPointer, currentAccumulatedCost + 1);
    } else if (characterAtRight === 'x') {
        return calculatePalindromeCost(subjectString, leftPointer, rightPointer - 1, currentAccumulatedCost + 1);
    } else {
        return -1;
    }
}

function Main(entryData) {
    const targetString = entryData[0];

    const finalResult = calculatePalindromeCost(targetString, 0, targetString.length - 1, 0);

    console.log(finalResult);

    return 0;
}
