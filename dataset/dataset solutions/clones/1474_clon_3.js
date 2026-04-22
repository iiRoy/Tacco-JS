(function(rawDataString) {
    const commandInstructions = rawDataString.split('\n');

    const initialStackCount = parseInt(commandInstructions.shift(), 10);

    const dataStoreCollection = Array.from({ length: initialStackCount }, () => []);

    const retrieveZeroBasedIndex = (argumentValue) => parseInt(argumentValue, 10) - 1;

    let operationsProcessed = 0;

    for (;;) {
        const currentCommandLine = commandInstructions.shift();

        if (!currentCommandLine) {
            break;
        }

        const currentCommandParts = currentCommandLine.split(' ');
        const operationType = currentCommandParts[0];
        const firstParameter = currentCommandParts[1];
        const secondParameter = currentCommandParts[2];

        if (operationType === 'terminate_session') {
            return;
        } else if (operationType === 'place_item') {
            const targetIndexBaseZero = retrieveZeroBasedIndex(firstParameter);
            const itemContent = secondParameter;
            if (targetIndexBaseZero >= 0 && targetIndexBaseZero < initialStackCount) {
                dataStoreCollection[targetIndexBaseZero].push(itemContent);
            }
            operationsProcessed++;
        } else if (operationType === 'extract_item') {
            const targetIndexBaseZero = retrieveZeroBasedIndex(firstParameter);
            let extractedContent = undefined;
            if (targetIndexBaseZero >= 0 && targetIndexBaseZero < initialStackCount) {
                extractedContent = dataStoreCollection[targetIndexBaseZero].pop();
            }
            console.log(extractedContent);
            operationsProcessed++;
        } else {
            const sourceIndex = retrieveZeroBasedIndex(firstParameter);
            const destinationIndex = retrieveZeroBasedIndex(secondParameter);

            if (sourceIndex >= 0 && sourceIndex < initialStackCount &&
                destinationIndex >= 0 && destinationIndex < initialStackCount) {
                const transferredItem = dataStoreCollection[sourceIndex].pop();
                if (transferredItem !== undefined) {
                    dataStoreCollection[destinationIndex].push(transferredItem);
                }
            }
            operationsProcessed++;
        }
    }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));