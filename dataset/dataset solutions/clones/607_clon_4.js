const fileSystemUtils = require('node:fs');
const standardInputPath = '/dev/stdin';
let inputStringRaw = fileSystemUtils.readFileSync(standardInputPath, 'utf8');
let processedTextBody = inputStringRaw.trim();

let maximumOValue = -Infinity;
let textBodyLength = processedTextBody.length;

let searchIndex = 0;
while (searchIndex < textBodyLength) {
    if (processedTextBody[searchIndex] === 'J') {
        let jSequenceStart = searchIndex;
        let currentJCount = 0;
        while (searchIndex < textBodyLength && processedTextBody[searchIndex] === 'J') {
            currentJCount++;
            searchIndex++;
        }

        if (searchIndex < textBodyLength && processedTextBody[searchIndex] === 'O') {
            let oSequenceStart = searchIndex;
            let currentOCount = 0;
            while (searchIndex < textBodyLength && processedTextBody[searchIndex] === 'O') {
                currentOCount++;
                searchIndex++;
            }

            if (searchIndex < textBodyLength && processedTextBody[searchIndex] === 'I') {
                let iSequenceStart = searchIndex;
                let currentICount = 0;
                while (searchIndex < textBodyLength && processedTextBody[searchIndex] === 'I') {
                    currentICount++;
                    searchIndex++;
                }

                if (currentJCount >= currentOCount && currentICount >= currentOCount) {
                    if (currentOCount > maximumOValue) {
                        maximumOValue = currentOCount;
                    }
                }
            }
        }
    } else {
        searchIndex++;
    }
}

process.stdout.write(maximumOValue + '\n');