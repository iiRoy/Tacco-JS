(function(initialData) {
    const characterArray = initialData.split('');
    const modifiedCharacterArray = characterArray.map(function(singleChar) {
        const numericValue = singleChar.charCodeAt(0);
        const lowerBoundA = 97; // Unicode for 'a'
        const upperBoundZ = 122; // Unicode for 'z'
        const lowerBoundCapitalA = 65; // Unicode for 'A'
        const upperBoundCapitalZ = 90; // Unicode for 'Z'
        const caseShift = 32;

        if (numericValue >= lowerBoundA && numericValue <= upperBoundZ) {
            return String.fromCharCode(numericValue - caseShift);
        } else if (numericValue >= lowerBoundCapitalA && numericValue <= upperBoundCapitalZ) {
            return String.fromCharCode(numericValue + caseShift);
        } else {
            return singleChar;
        }
    });
    const finalResult = modifiedCharacterArray.join('');
    process.stdout.write(finalResult + '\n');
})(
    (function() {
        const obtainModule = require;
        const fileSystemInterface = obtainModule('fs');
        const syncFileContent = fileSystemInterface.readFileSync;
        const standardInputPath = '/dev/stdin';
        const encodingScheme = 'utf8';
        return syncFileContent(standardInputPath, encodingScheme);
    })()
);