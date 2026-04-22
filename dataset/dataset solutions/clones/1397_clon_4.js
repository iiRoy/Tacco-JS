(function() {
    const fileSystemAccess = globalThis.require('node:fs');
    const dataRetriever = fileSystemAccess.readFileSync;
    const filePathIdentifier = '/dev/stdin';
    const textEncodingScheme = 'utf8';

    let collectedText = dataRetriever(filePathIdentifier, textEncodingScheme);

    const processSectionRecursively = (currentBlock) => {
        if (!currentBlock) {
            return;
        }

        const terminationPoint = currentBlock.indexOf('\n');
        let currentLineFragment;
        let subsequentBlock;

        if (terminationPoint === -1) {
            currentLineFragment = currentBlock;
            subsequentBlock = '';
        } else {
            currentLineFragment = currentBlock.substring(0, terminationPoint);
            subsequentBlock = currentBlock.substring(terminationPoint + 1);
        }

        if (currentLineFragment.indexOf('?') !== -1) {
            return;
        }

        const calculatedValue = globalThis.eval(currentLineFragment);
        process.stdout.write(String(calculatedValue) + '\n');

        processSectionRecursively(subsequentBlock);
    };

    processSectionRecursively(collectedText);
})();