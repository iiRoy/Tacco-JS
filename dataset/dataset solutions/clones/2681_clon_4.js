const analyzeElevationProfile = (inputData) => {
    const dataLines = inputData.split('\n');
    const countElements = parseInt(dataLines[0], 10);
    const initialValuesStr = dataLines[1].split(' ');

    const initialNumericValues = initialValuesStr.slice(0, countElements).map((item, position) => {
        const numericItem = Number(item);
        return (position === 0 && numericItem > 0) ? numericItem - 1 : numericItem;
    });

    const checkSequenceValidity = (currentIndex, currentSequence, currentOutcome) => {
        if (currentIndex >= currentSequence.length || currentOutcome === 'No') {
            return { processedSequence: currentSequence, finalOutcome: currentOutcome };
        }

        const precedingValue = currentSequence[currentIndex - 1];
        const currentValue = currentSequence[currentIndex];
        let nextOutcome = currentOutcome;
        let transformedSequence = [...currentSequence];

        if (precedingValue < currentValue) {
            transformedSequence[currentIndex] = currentValue - 1;
        } else if (precedingValue > currentValue) {
            if (precedingValue - currentValue !== 1) {
                nextOutcome = 'No';
            }
        }
        
        return checkSequenceValidity(currentIndex + 1, transformedSequence, nextOutcome);
    };

    const processingResult = checkSequenceValidity(1, initialNumericValues, 'Yes');

    processingResult.processedSequence.forEach(val => {
        console.log(val);
    });
    console.log(processingResult.finalOutcome);
};

const systemInput = require('fs').readFileSync('/dev/stdin', 'utf8');
analyzeElevationProfile(systemInput);