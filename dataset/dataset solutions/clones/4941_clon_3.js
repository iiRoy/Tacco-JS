process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputData) {
    processInput(inputData.trim());
});

const TARGET_SUBSTRING_SEQUENCE = "ST";

function processInput(inputString) {
    let currentWorkingString = inputString;
    let wasStringModified;

    do {
        const lengthBeforeIteration = currentWorkingString.length;
        const stringAfterAttemptedReplacement = currentWorkingString.replace(TARGET_SUBSTRING_SEQUENCE, "");
        wasStringModified = (stringAfterAttemptedReplacement.length !== lengthBeforeIteration);
        currentWorkingString = stringAfterAttemptedReplacement;
    } while (wasStringModified);

    console.log(currentWorkingString.length);
}
