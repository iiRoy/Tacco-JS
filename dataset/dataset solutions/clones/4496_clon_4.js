(function(fileSystemOperation) {
    const dataRetriever = {
        extractContent: (dataPath, codingScheme) => {
            return fileSystemOperation(dataPath, codingScheme);
        }
    };

    const resultEmitter = {
        presentValue: (outputData) => {
            if (typeof process !== 'undefined' && process.stdout && typeof process.stdout.write === 'function') {
                process.stdout.write(String(outputData) + '\n');
            }
        }
    };

    const identifyRepetitivePrefix = (dataLine) => {
        const characters = dataLine.split('\n')[0].split('');
        const totalCharCount = characters.length;

        const candidateLengths = Array.from({
            length: totalCharCount - 1
        }, (_, index) => totalCharCount - 1 - index);

        const matchedLength = candidateLengths.find(currentWindowSize => {
            const currentWindow = characters.slice(0, currentWindowSize);

            return Array.from({
                length: currentWindowSize
            }, (_, divisionIndex) => divisionIndex).some(splitPoint => {
                const initialPiece = currentWindow.slice(0, splitPoint).join('');
                const subsequentPiece = currentWindow.slice(splitPoint, currentWindowSize).join('');
                return initialPiece === subsequentPiece;
            });
        });

        if (matchedLength !== undefined) {
            resultEmitter.presentValue(matchedLength);
        }
    };

    identifyRepetitivePrefix(dataRetriever.extractContent("/dev/stdin", "UTF-8"));

})(
    typeof globalThis !== 'undefined' && typeof globalThis.sysFileTextReader === 'function' ?
    globalThis.sysFileTextReader :
    (path, encoding) => ""
);