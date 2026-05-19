process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputBuffer = '';
process.stdin.on('data', function(dataChunk) {
    inputBuffer += dataChunk;
});

process.stdin.on('end', function() {
    processInputData(inputBuffer.split(/\r?\n/));
});

function processInputData(lines) {
    const targetString = lines[0];
    let leftIndex = 0;
    let rightIndex = targetString.length - 1;
    let requiredXInsertions = 0;
    const X_CHARACTER = 'x';
    let isPalindromePossible = true;

    while (leftIndex < rightIndex) {
        const charAtLeft = targetString.charAt(leftIndex);
        const charAtRight = targetString.charAt(rightIndex);

        if (charAtLeft === charAtRight) {
            leftIndex++;
            rightIndex--;
        } else {
            // Characters do not match, check for 'x'
            if (charAtLeft === X_CHARACTER) {
                leftIndex++;
                requiredXInsertions++;
            } else if (charAtRight === X_CHARACTER) {
                rightIndex--;
                requiredXInsertions++;
            } else {
                // Irreconcilable mismatch, cannot form a palindrome
                isPalindromePossible = false;
                break;
            }
        }
    }

    if (!isPalindromePossible) {
        requiredXInsertions = -1;
    }

    console.log(requiredXInsertions);

    return 0;
}
