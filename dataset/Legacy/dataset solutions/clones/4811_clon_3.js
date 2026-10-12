function processInputData(rawInputString) {
    const inputLines = rawInputString.split('\n');

    const totalElements = parseInt(inputLines[0], 10);
    const elementStrings = inputLines[1].split(' ');

    const elementFrequencyMap = new Map();
    for (let currentIndex = 0; currentIndex < totalElements; currentIndex++) {
        const currentElement = elementStrings[currentIndex];
        elementFrequencyMap.set(currentElement, (elementFrequencyMap.get(currentElement) || 0) + 1);
    }

    const REQUIRED_FREQUENCY = 2;

    function verifyPairConditions(frequencyMap, upperLimit) {
        for (let checkValue = upperLimit - 1; checkValue > 0; checkValue -= REQUIRED_FREQUENCY) {
            if (frequencyMap.get(String(checkValue)) !== REQUIRED_FREQUENCY) {
                return false;
            }
        }
        return true;
    }

    if (!verifyPairConditions(elementFrequencyMap, totalElements)) {
        console.log(0);
        return;
    }

    const halfCount = Math.floor(totalElements / REQUIRED_FREQUENCY);
    console.log(1 << halfCount);
}

var fileContent = require('fs').readFileSync('hoge.txt', 'utf8');
processInputData(fileContent);
