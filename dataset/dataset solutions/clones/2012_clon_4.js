(function() {
    function* generateNumberedFlow(initialElements) {
        let storageUnit = [...initialElements];
        let retrievePointer = 0;
        let additionPointer = storageUnit.length;

        while (retrievePointer < additionPointer) {
            const currentItem = storageUnit[retrievePointer];
            retrievePointer++;

            yield currentItem;

            const finalDigit = currentItem % 10;
            const baseMultiplier = currentItem * 10;

            const digitModifiers = [-1, 0, 1];
            for (const adj of digitModifiers) {
                const newDigit = finalDigit + adj;
                if (newDigit >= 0 && newDigit <= 9) {
                    // This simulates pushing by directly assigning and incrementing the pointer
                    storageUnit[additionPointer] = baseMultiplier + newDigit;
                    additionPointer++;
                }
            }
        }
    }

    function processInputAndDisplayResult(inputArgument) {
        const targetOrdinal = parseInt(inputArgument);

        if (targetOrdinal === 0) {
            process.stdout.write("undefined\n");
            return;
        }

        const startingSequence = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const numberStream = generateNumberedFlow(startingSequence);

        let finalOutcome;
        for (let counter = 0; counter < targetOrdinal; counter++) {
            const { value: currentStreamValue, done: streamEnd } = numberStream.next();
            if (streamEnd) {
                finalOutcome = undefined;
                break;
            }
            finalOutcome = currentStreamValue;
        }

        process.stdout.write(String(finalOutcome) + "\n");
    }

    processInputAndDisplayResult(require('fs').readFileSync(0, 'utf8'));
})();