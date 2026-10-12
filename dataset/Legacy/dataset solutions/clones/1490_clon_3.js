(async () => {
    const readAllStdinContent = async () => {
        const inputChunks = [];
        for await (const dataChunk of process.stdin) {
            inputChunks.push(dataChunk);
        }
        return inputChunks.join('');
    };

    const fullInputStringContent = await readAllStdinContent();
    const processedInputLines = fullInputStringContent.split(/\n/);

    const parseInitialParameters = (firstLineContent) => {
        const parts = firstLineContent.split(/\s/).map(Number);
        const arrayLength = parts[0];
        const numberOfQueries = parts[1];
        return { arrayLength, numberOfQueries };
    };

    const { arrayLength, numberOfQueries } = parseInitialParameters(processedInputLines[0]);

    const parseQueryDetails = (queryLineContent) => {
        return queryLineContent.split(/\s/).map(Number);
    };

    const allParsedQueries = processedInputLines.slice(1, numberOfQueries + 1).map(parseQueryDetails);

    const digitSequenceArray = Array.from({ length: arrayLength }, () => 1);

    const modulusValue = 998244353;

    const calculateAndOutputCurrentValue = () => {
        let currentCalculatedValue = 0;
        const sequenceSize = digitSequenceArray.length;
        for (let sequenceElementIndex = 0; sequenceElementIndex < sequenceSize; ++sequenceElementIndex) {
            const digitAtCurrentPosition = digitSequenceArray[sequenceElementIndex];
            let productWithTen = currentCalculatedValue * 10;
            productWithTen = (productWithTen + digitAtCurrentPosition);
            currentCalculatedValue = productWithTen % modulusValue;
        }
        console.log(currentCalculatedValue);
    };

    allParsedQueries.forEach(currentQueryOperation => {
        const originalLeftBound = currentQueryOperation[0];
        const originalRightBound = currentQueryOperation[1];
        const valueToFill = currentQueryOperation[2];

        const zeroBasedStartIndex = originalLeftBound - 1;
        const zeroBasedEndIndex = originalRightBound - 1;

        for (let updatePositionIndex = zeroBasedStartIndex; updatePositionIndex <= zeroBasedEndIndex; ++updatePositionIndex) {
            digitSequenceArray[updatePositionIndex] = valueToFill;
        }

        calculateAndOutputCurrentValue();
    });

})();
