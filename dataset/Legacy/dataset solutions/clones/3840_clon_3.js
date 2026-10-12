let inputReadCount = 0;
let processedString;
let targetKValue;

function handleInputChunk(chunkData) {
    inputReadCount++;
    const chunkStr = chunkData.toString();

    switch (inputReadCount) {
        case 1:
            processedString = chunkStr.toLowerCase();
            break;
        case 2:
            targetKValue = Number(chunkStr);
            break;
    }
}

function validateInputParameters(strLen, kVal) {
    const minimumStringLength = 1;
    const maximumStringLength = 5000;
    const minimumKValue = 1;
    const maximumKValue = 5;

    if (strLen < minimumStringLength || strLen > maximumStringLength) {
        process.exit();
    }

    if (kVal < minimumKValue || kVal > maximumKValue) {
        process.exit();
    }
}

function executeSubstringLogic(sourceStr, kIndex) {
    const sourceStringLength = sourceStr.length;

    validateInputParameters(sourceStringLength, kIndex);

    const collectedUniqueSubstrings = new Set();
    let tempSubstr;

    for (let i = 0; i <= sourceStringLength; i++) {
        for (let j = i; j <= sourceStringLength; j++) {
            tempSubstr = sourceStr.substring(i, j);
            const isNonEmpty = tempSubstr.length > 0;
            const containsNoNewline = !tempSubstr.includes('\n');

            if (isNonEmpty && containsNoNewline) {
                collectedUniqueSubstrings.add(tempSubstr);
            }
        }
    }

    const sortedSubstringsArray = Array.from(collectedUniqueSubstrings);
    sortedSubstringsArray.sort();

    const finalResultIndex = kIndex - 1;

    console.log(sortedSubstringsArray[finalResultIndex]);
    process.exit();
}

process.stdin.on('data', handleInputChunk);

process.stdin.on('end', function() {
    executeSubstringLogic(processedString, targetKValue);
});
